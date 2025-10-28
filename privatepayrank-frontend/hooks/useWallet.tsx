"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { ethers } from "ethers";

// EIP-6963 types
interface EIP6963ProviderInfo {
  uuid: string;
  name: string;
  icon: string;
  rdns: string;
}

interface EIP6963ProviderDetail {
  info: EIP6963ProviderInfo;
  provider: ethers.Eip1193Provider;
}

interface WalletState {
  address: string | null;
  chainId: number | null;
  isConnected: boolean;
  isConnecting: boolean;
  provider: ethers.Eip1193Provider | null;
  signer: ethers.JsonRpcSigner | null;
}

const STORAGE_KEYS = {
  CONNECTED: "wallet.connected",
  CONNECTOR_ID: "wallet.lastConnectorId",
  ACCOUNTS: "wallet.lastAccounts",
  CHAIN_ID: "wallet.lastChainId",
};

export function useWallet() {
  const [state, setState] = useState<WalletState>({
    address: null,
    chainId: null,
    isConnected: false,
    isConnecting: false,
    provider: null,
    signer: null,
  });

  const [availableWallets, setAvailableWallets] = useState<EIP6963ProviderDetail[]>([]);
  const providerRef = useRef<ethers.Eip1193Provider | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const hasTriedAutoReconnectRef = useRef(false);

  // Clear stored connection info
  const clearStoredConnection = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.CONNECTED);
    localStorage.removeItem(STORAGE_KEYS.CONNECTOR_ID);
    localStorage.removeItem(STORAGE_KEYS.ACCOUNTS);
    localStorage.removeItem(STORAGE_KEYS.CHAIN_ID);
  }, []);

  // Setup event listeners for wallet changes
  const setupEventListeners = useCallback((provider: ethers.Eip1193Provider) => {
    const handleAccountsChanged = (accounts: string[]) => {
      console.log("[useWallet] Accounts changed:", accounts);
      
      if (accounts.length === 0) {
        clearStoredConnection();
        setState({
          address: null,
          chainId: null,
          isConnected: false,
          isConnecting: false,
          provider: null,
          signer: null,
        });
      } else {
        setState((prev) => ({
          ...prev,
          address: accounts[0],
        }));
        localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
        
        // Clear old account's decryption signatures
        const keys = Object.keys(localStorage);
        keys.forEach((key) => {
          if (key.startsWith("fhevm.decryptionSignature.") && !key.includes(accounts[0])) {
            localStorage.removeItem(key);
          }
        });
      }
    };

    const handleChainChanged = (chainId: string) => {
      const chainIdNum = parseInt(chainId, 16);
      console.log("[useWallet] Chain changed:", chainIdNum);
      
      setState((prev) => ({
        ...prev,
        chainId: chainIdNum,
      }));
      localStorage.setItem(STORAGE_KEYS.CHAIN_ID, chainIdNum.toString());
    };

    const handleDisconnect = () => {
      console.log("[useWallet] Wallet disconnected");
      clearStoredConnection();
      setState({
        address: null,
        chainId: null,
        isConnected: false,
        isConnecting: false,
        provider: null,
        signer: null,
      });
    };

    // Type assertion for event listener methods
    const providerWithEvents = provider as any;
    providerWithEvents.on?.("accountsChanged", handleAccountsChanged);
    providerWithEvents.on?.("chainChanged", handleChainChanged);
    providerWithEvents.on?.("disconnect", handleDisconnect);
  }, [clearStoredConnection]);

  // Silent reconnect (no popup)
  const silentReconnect = useCallback(async (provider: ethers.Eip1193Provider, connectorId: string) => {
    try {
      console.log("[useWallet] Attempting silent reconnect with", connectorId);
      
      // Use eth_accounts (doesn't show popup)
      const accounts = await provider.request({
        method: "eth_accounts",
      }) as string[];

      if (!accounts || accounts.length === 0) {
        console.log("[useWallet] No accounts found, clearing connection");
        clearStoredConnection();
        hasTriedAutoReconnectRef.current = false;
        return;
      }

      const chainId = await provider.request({ method: "eth_chainId" }) as string;
      const chainIdNum = parseInt(chainId, 16);

      const ethersProvider = new ethers.BrowserProvider(provider);
      const signer = await ethersProvider.getSigner();

      providerRef.current = provider;
      setupEventListeners(provider);

      setState({
        address: accounts[0],
        chainId: chainIdNum,
        isConnected: true,
        isConnecting: false,
        provider,
        signer,
      });

      // Restore connection info
      localStorage.setItem(STORAGE_KEYS.CONNECTED, "true");
      localStorage.setItem(STORAGE_KEYS.CONNECTOR_ID, connectorId);
      localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
      localStorage.setItem(STORAGE_KEYS.CHAIN_ID, chainIdNum.toString());

      console.log("[useWallet] ✅ Auto-reconnected:", accounts[0]);
      hasTriedAutoReconnectRef.current = true;
    } catch (error) {
      console.error("[useWallet] ❌ Silent reconnect failed:", error);
      clearStoredConnection();
      hasTriedAutoReconnectRef.current = false;
    }
  }, [clearStoredConnection, setupEventListeners]);

  // EIP-6963: Discover wallet providers
  useEffect(() => {
    const wallets: EIP6963ProviderDetail[] = [];

    function onAnnounceProvider(event: CustomEvent<EIP6963ProviderDetail>) {
      console.log("[useWallet] Discovered wallet:", event.detail.info.name);
      wallets.push(event.detail);
      setAvailableWallets([...wallets]);
    }

    window.addEventListener(
      "eip6963:announceProvider",
      onAnnounceProvider as EventListener
    );

    // Request providers to announce themselves
    window.dispatchEvent(new Event("eip6963:requestProvider"));

    return () => {
      window.removeEventListener(
        "eip6963:announceProvider",
        onAnnounceProvider as EventListener
      );
    };
  }, []);

  // Auto-reconnect on mount
  useEffect(() => {
    const attemptAutoReconnect = async () => {
      // Prevent duplicate attempts
      if (hasTriedAutoReconnectRef.current || state.isConnected) {
        return;
      }

      const wasConnected = localStorage.getItem(STORAGE_KEYS.CONNECTED);
      const lastConnectorId = localStorage.getItem(STORAGE_KEYS.CONNECTOR_ID);

      if (wasConnected !== "true" || !lastConnectorId) {
        console.log("[useWallet] No saved connection to restore");
        return;
      }

      console.log("[useWallet] Attempting to restore connection to", lastConnectorId);
      hasTriedAutoReconnectRef.current = true;

      // Always use window.ethereum for auto-reconnect (more reliable)
      if ((window as any).ethereum) {
        console.log("[useWallet] Using window.ethereum for auto-reconnect");
        await silentReconnect((window as any).ethereum, "injected");
      } else {
        console.log("[useWallet] window.ethereum not available, clearing connection state");
        clearStoredConnection();
        hasTriedAutoReconnectRef.current = false;
      }
    };

    attemptAutoReconnect();
  }, [state.isConnected, silentReconnect, clearStoredConnection]);

  // Connect to wallet (shows popup)
  const connect = useCallback(
    async (walletDetail?: EIP6963ProviderDetail) => {
      if (state.isConnecting || state.isConnected) {
        console.log("[useWallet] Already connected or connecting");
        return;
      }

      setState((prev) => ({ ...prev, isConnecting: true }));

      // Abort previous connection attempt
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      try {
        let provider: ethers.Eip1193Provider;
        let connectorId: string;

        if (walletDetail) {
          provider = walletDetail.provider;
          connectorId = walletDetail.info.uuid;
          console.log("[useWallet] Connecting to", walletDetail.info.name);
        } else {
          // Always use window.ethereum for simplicity (it's always available if MetaMask is installed)
          if ((window as any).ethereum) {
            provider = (window as any).ethereum;
            connectorId = "injected";
            console.log("[useWallet] Using window.ethereum");
          } else if (availableWallets.length > 0) {
            // Fallback to EIP-6963 wallet
            provider = availableWallets[0].provider;
            connectorId = availableWallets[0].info.uuid;
            console.log("[useWallet] Using EIP-6963 wallet:", availableWallets[0].info.name);
          } else {
            throw new Error("No wallet found");
          }
        }

        // Request accounts (shows popup)
        const accounts = await provider.request({
          method: "eth_requestAccounts",
        }) as string[];

        if (abortControllerRef.current.signal.aborted) {
          return;
        }

        if (!accounts || accounts.length === 0) {
          throw new Error("No accounts found");
        }

        const chainId = await provider.request({ method: "eth_chainId" }) as string;
        const chainIdNum = parseInt(chainId, 16);

        const ethersProvider = new ethers.BrowserProvider(provider);
        const signer = await ethersProvider.getSigner();

        // Store connection info
        localStorage.setItem(STORAGE_KEYS.CONNECTED, "true");
        localStorage.setItem(STORAGE_KEYS.CONNECTOR_ID, connectorId);
        localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
        localStorage.setItem(STORAGE_KEYS.CHAIN_ID, chainIdNum.toString());

        providerRef.current = provider;
        setupEventListeners(provider);

        setState({
          address: accounts[0],
          chainId: chainIdNum,
          isConnected: true,
          isConnecting: false,
          provider,
          signer,
        });

        console.log("[useWallet] ✅ Connected:", accounts[0], "on chain", chainIdNum);
        console.log("[useWallet] Saved connectorId:", connectorId);
        console.log("[useWallet] Available wallets:", availableWallets.map(w => ({ name: w.info.name, uuid: w.info.uuid })));
      } catch (error: any) {
        console.error("[useWallet] ❌ Connection failed:", error);
        setState((prev) => ({ ...prev, isConnecting: false }));
        throw error;
      }
    },
    [state.isConnecting, state.isConnected, availableWallets, setupEventListeners]
  );

  // Disconnect wallet
  const disconnect = useCallback(() => {
    clearStoredConnection();
    hasTriedAutoReconnectRef.current = false;

    if (providerRef.current) {
      (providerRef.current as any).removeAllListeners?.();
      providerRef.current = null;
    }

    setState({
      address: null,
      chainId: null,
      isConnected: false,
      isConnecting: false,
      provider: null,
      signer: null,
    });

    console.log("[useWallet] Disconnected");
  }, [clearStoredConnection]);

  // Switch chain
  const switchChain = useCallback(
    async (targetChainId: number) => {
      if (!state.provider) {
        throw new Error("No provider connected");
      }

      try {
        await state.provider.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: `0x${targetChainId.toString(16)}` }],
        });
      } catch (error: any) {
        // Chain not added to wallet
        if (error.code === 4902) {
          throw new Error("Chain not added to wallet. Please add it manually.");
        }
        throw error;
      }
    },
    [state.provider]
  );

  return {
    ...state,
    availableWallets,
    connect,
    disconnect,
    switchChain,
  };
}
