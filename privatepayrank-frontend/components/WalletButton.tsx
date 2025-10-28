"use client";

import { useState } from "react";
import { useWallet } from "@/hooks/useWallet";

export function WalletButton() {
  const { address, chainId, isConnected, isConnecting, connect, disconnect, availableWallets } =
    useWallet();
  const [showWalletMenu, setShowWalletMenu] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);

  // Filter wallets - don't show duplicates (MetaMask appears in both window.ethereum and EIP-6963)
  const filteredWallets = availableWallets.filter((wallet, index, self) => 
    index === self.findIndex(w => w.info.uuid === wallet.info.uuid)
  );

  // Show menu only if there are multiple unique wallets
  const shouldShowMenu = filteredWallets.length > 1 || (filteredWallets.length === 1 && !(window as any).ethereum);

  const handleConnect = async (walletIndex?: number) => {
    try {
      if (walletIndex !== undefined && availableWallets[walletIndex]) {
        await connect(availableWallets[walletIndex]);
      } else {
        await connect();
      }
      setShowWalletMenu(false);
    } catch (error) {
      console.error("Connection failed:", error);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setShowAccountMenu(false);
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const getChainName = (id: number) => {
    switch (id) {
      case 1:
        return "Ethereum";
      case 11155111:
        return "Sepolia";
      case 31337:
        return "Hardhat";
      default:
        return `Chain ${id}`;
    }
  };

  if (isConnecting) {
    return (
      <button
        disabled
        className="px-4 py-2 bg-teal-400 text-white rounded-lg opacity-50 cursor-not-allowed"
      >
        Connecting...
      </button>
    );
  }

  if (!isConnected) {
    return (
      <div className="relative">
        <button
          onClick={async () => {
            if (shouldShowMenu) {
              setShowWalletMenu(!showWalletMenu);
            } else {
              try {
                await handleConnect();
              } catch (error) {
                console.error("Connection error:", error);
              }
            }
          }}
          disabled={isConnecting}
          className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
        >
          {isConnecting ? "Connecting..." : "Connect Wallet"}
        </button>

        {/* Wallet Selection Menu */}
        {showWalletMenu && shouldShowMenu && filteredWallets.length > 0 && (
          <div className="absolute right-0 mt-2 w-64 glass dark:glass-dark rounded-lg shadow-xl border border-teal-200 dark:border-teal-800 p-2 z-50">
            <div className="text-sm font-semibold text-teal-700 dark:text-teal-300 px-3 py-2">
              Select Wallet
            </div>
            {filteredWallets.map((wallet, index) => (
              <button
                key={`wallet-${wallet.info.uuid}-${index}`}
                onClick={() => handleConnect(index)}
                className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-teal-100 dark:hover:bg-teal-900/30 transition-colors"
              >
                {wallet.info.icon && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={wallet.info.icon}
                    alt={wallet.info.name}
                    className="w-6 h-6"
                  />
                )}
                <span className="text-sm text-teal-700 dark:text-teal-300">
                  {wallet.info.name}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowAccountMenu(!showAccountMenu)}
        className="px-4 py-2 glass dark:glass-dark border border-teal-300 dark:border-teal-700 rounded-lg hover:border-teal-500 dark:hover:border-teal-500 transition-all"
      >
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm font-mono text-teal-700 dark:text-teal-300">
            {formatAddress(address!)}
          </span>
          {chainId && (
            <span className="text-xs text-teal-600 dark:text-teal-400 bg-teal-100 dark:bg-teal-900/30 px-2 py-1 rounded">
              {getChainName(chainId)}
            </span>
          )}
        </div>
      </button>

      {/* Account Menu */}
      {showAccountMenu && (
        <div className="absolute right-0 mt-2 w-64 glass dark:glass-dark rounded-lg shadow-xl border border-teal-200 dark:border-teal-800 p-2 z-50">
          <div className="px-3 py-2 border-b border-teal-200 dark:border-teal-800">
            <div className="text-xs text-teal-600 dark:text-teal-400 mb-1">
              Connected Account
            </div>
            <div className="text-sm font-mono text-teal-700 dark:text-teal-300">
              {address}
            </div>
            {chainId && (
              <div className="text-xs text-teal-600 dark:text-teal-400 mt-1">
                {getChainName(chainId)} (Chain ID: {chainId})
              </div>
            )}
          </div>
          
          <button
            onClick={handleDisconnect}
            className="w-full mt-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
}

