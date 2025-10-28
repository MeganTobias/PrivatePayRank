"use client";

import { useWallet } from "@/hooks/useWallet";
import { useFHEVM } from "@/hooks/useFHEVM";
import { usePrivatePayRank } from "@/hooks/usePrivatePayRank";
import { createContext, useContext, ReactNode, useEffect } from "react";
import type { FhevmInstance } from "@/fhevm/fhevmTypes";
import { ethers } from "ethers";

interface AppContextType {
  // Wallet
  address: string | null;
  chainId: number | null;
  isConnected: boolean;
  isConnecting: boolean;
  connect: (walletDetail?: any) => Promise<void>;
  disconnect: () => void;
  switchChain: (chainId: number) => Promise<void>;
  signer: ethers.JsonRpcSigner | null;
  provider: any;
  
  // FHEVM
  fhevmInstance: FhevmInstance | null;
  fhevmStatus: string;
  fhevmIsReady: boolean;
  
  // Contract
  totalSubmissions: number;
  averageIncome: number;
  distribution: number[];
  hasSubmitted: boolean;
  userLabel: string;
  decryptedIncome: number | null;
  isSubmitting: boolean;
  isDecrypting: boolean;
  isLoading: boolean;
  message: string;
  submitIncome: (income: number, label: string) => Promise<any>;
  updateIncome: (income: number, label: string) => Promise<any>;
  decryptUserIncome: () => Promise<number | undefined>;
  refreshData: () => Promise<void>;
  calculateRealStatistics: () => Promise<void>;
  canSubmit: boolean;
  canUpdate: boolean;
  canDecrypt: boolean;
  contractAddress: string | null;
}

const AppContext = createContext<AppContextType | null>(null);

export function Providers({ children }: { children: ReactNode }) {
  const wallet = useWallet();
  const fhevm = useFHEVM({
    provider: wallet.provider,
    chainId: wallet.chainId,
    enabled: wallet.isConnected,
  });
  
  const contract = usePrivatePayRank({
    instance: fhevm.instance,
    chainId: wallet.chainId,
    signer: wallet.signer,
    provider: wallet.provider,
  });

  // Debug logging
  useEffect(() => {
    console.log("[Providers] Wallet state:", {
      isConnected: wallet.isConnected,
      address: wallet.address,
      chainId: wallet.chainId,
      isLoading: fhevm.isLoading,
      fhevmStatus: fhevm.status,
    });
  }, [wallet.isConnected, wallet.address, wallet.chainId, fhevm.isLoading, fhevm.status]);

  const value: AppContextType = {
    // Wallet
    address: wallet.address,
    chainId: wallet.chainId,
    isConnected: wallet.isConnected,
    isConnecting: wallet.isConnecting,
    connect: wallet.connect,
    disconnect: wallet.disconnect,
    switchChain: wallet.switchChain,
    signer: wallet.signer,
    provider: wallet.provider,
    
    // FHEVM
    fhevmInstance: fhevm.instance,
    fhevmStatus: fhevm.status,
    fhevmIsReady: fhevm.isReady,
    
    // Contract
    totalSubmissions: contract.totalSubmissions,
    averageIncome: contract.averageIncome,
    distribution: contract.distribution,
    hasSubmitted: contract.hasSubmitted,
    userLabel: contract.userLabel,
    decryptedIncome: contract.decryptedIncome,
    isSubmitting: contract.isSubmitting,
    isDecrypting: contract.isDecrypting,
    isLoading: contract.isLoading,
    message: contract.message,
    submitIncome: contract.submitIncome,
    updateIncome: contract.updateIncome,
    decryptUserIncome: contract.decryptUserIncome,
    refreshData: contract.refreshData,
    calculateRealStatistics: contract.calculateRealStatistics,
    canSubmit: contract.canSubmit,
    canUpdate: contract.canUpdate,
    canDecrypt: contract.canDecrypt,
    contractAddress: contract.contractAddress,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within Providers");
  }
  return context;
}




