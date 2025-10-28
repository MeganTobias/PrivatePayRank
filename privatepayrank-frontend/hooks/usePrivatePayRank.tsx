"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { ethers } from "ethers";
import type { FhevmInstance } from "@/fhevm/fhevmTypes";
import { FhevmDecryptionSignature } from "@/fhevm/FhevmDecryptionSignature";
import { GenericStringStorage } from "@/fhevm/GenericStringStorage";
import { PrivatePayRankABI } from "@/abi/PrivatePayRankABI";
import { PrivatePayRankAddresses } from "@/abi/PrivatePayRankAddresses";

interface UsePrivatePayRankParams {
  instance: FhevmInstance | null;
  chainId: number | null;
  signer: ethers.JsonRpcSigner | null;
  provider: any;
}

const storage = new GenericStringStorage();

export function usePrivatePayRank({
  instance,
  chainId,
  signer,
  provider,
}: UsePrivatePayRankParams) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  
  // Contract data
  const [totalSubmissions, setTotalSubmissions] = useState<number>(0);
  const [averageIncome, setAverageIncome] = useState<number>(0);
  const [distribution, setDistribution] = useState<number[]>([0, 0, 0, 0, 0, 0]);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [userLabel, setUserLabel] = useState("");
  const [userIncomeHandle, setUserIncomeHandle] = useState<string | null>(null);
  const [decryptedIncome, setDecryptedIncome] = useState<number | null>(null);

  const contractRef = useRef<ethers.Contract | null>(null);
  const addressRef = useRef<string | null>(null);

  // Get contract address for current chain
  const getContractAddress = useCallback(() => {
    if (!chainId) return null;
    const entry = PrivatePayRankAddresses[chainId.toString() as keyof typeof PrivatePayRankAddresses];
    return entry?.address || null;
  }, [chainId]);

  // Initialize contract
  useEffect(() => {
    const address = getContractAddress();
    if (!address || !signer || address === ethers.ZeroAddress) {
      contractRef.current = null;
      addressRef.current = null;
      return;
    }

    addressRef.current = address;
    contractRef.current = new ethers.Contract(
      address,
      PrivatePayRankABI.abi,
      signer
    );

    console.log("[usePrivatePayRank] Contract initialized:", address);
  }, [getContractAddress, signer]);

  // Refresh contract data
  const refreshData = useCallback(async () => {
    if (!contractRef.current || !signer) return;

    setIsLoading(true);
    try {
      const userAddress = await signer.getAddress();
      console.log("[usePrivatePayRank] Refreshing data for address:", userAddress);
      
      // Read public data
      const [total, average, dist, submitted, label] = await Promise.all([
        contractRef.current.getTotalSubmissions(),
        contractRef.current.getAverageIncome(),
        contractRef.current.getDistribution(),
        contractRef.current.hasSubmitted(userAddress),
        contractRef.current.userLabels(userAddress),
      ]);

      console.log("[usePrivatePayRank] Contract hasSubmitted result:", submitted);
      console.log("[usePrivatePayRank] Contract data:", { total: Number(total), submitted, label });

      setTotalSubmissions(Number(total));
      setAverageIncome(Number(average));
      setDistribution(dist.map((d: bigint) => Number(d)));
      setHasSubmitted(submitted);
      setUserLabel(label);

      // Get encrypted income handle if submitted
      if (submitted) {
        try {
          const handle = await contractRef.current.getUserIncome();
          setUserIncomeHandle(handle);
        } catch (err) {
          console.error("Failed to get income handle:", err);
        }
      }

      console.log("[usePrivatePayRank] Data refreshed");
    } catch (error) {
      console.error("[usePrivatePayRank] Failed to refresh data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [signer]);

  // Submit encrypted income
  const submitIncome = useCallback(
    async (incomeValue: number, label: string = "") => {
      console.log("[usePrivatePayRank] submitIncome called");
      console.log("[usePrivatePayRank] instance:", instance);
      console.log("[usePrivatePayRank] instance type:", typeof instance);
      console.log("[usePrivatePayRank] instance.createEncryptedInput:", typeof instance?.createEncryptedInput);
      
      if (!instance || !contractRef.current || !signer || !addressRef.current) {
        throw new Error("Not ready to submit");
      }

      setIsSubmitting(true);
      setMessage("Encrypting income...");

      try {
        const userAddress = await signer.getAddress();

        // Create encrypted input
        console.log("[usePrivatePayRank] Calling createEncryptedInput...");
        const input = instance.createEncryptedInput(
          addressRef.current,
          userAddress
        );
        input.add32(incomeValue);

        setMessage("Generating proof...");
        const encryptedData = await input.encrypt();

        setMessage("Submitting transaction...");
        const tx = await contractRef.current.submitIncome(
          encryptedData.handles[0],
          encryptedData.inputProof,
          label
        );

        setMessage("Waiting for confirmation...");
        const receipt = await tx.wait();

        // Save the original value for Mock decryption
        const network = await signer.provider?.getNetwork();
        if (network?.chainId === BigInt(31337)) {
          // Save submitted value for Mock mode decryption
          localStorage.setItem(`mock_income_${userAddress}`, incomeValue.toString());
          console.log("[usePrivatePayRank] Saved income for Mock decryption:", incomeValue);
        }

        setMessage("Income submitted successfully!");
        console.log("[usePrivatePayRank] Income submitted:", receipt.hash);

        // Refresh data
        await refreshData();

        return receipt;
      } catch (error: any) {
        console.error("[usePrivatePayRank] Submit failed:", error);
        setMessage(`Failed to submit: ${error.message}`);
        throw error;
      } finally {
        setIsSubmitting(false);
      }
    },
    [instance, signer, refreshData]
  );

  // Update income
  const updateIncome = useCallback(
    async (incomeValue: number, label: string = "") => {
      if (!instance || !contractRef.current || !signer || !addressRef.current) {
        throw new Error("Not ready to update");
      }

      setIsSubmitting(true);
      setMessage("Encrypting new income...");

      try {
        const userAddress = await signer.getAddress();

        const input = instance.createEncryptedInput(
          addressRef.current,
          userAddress
        );
        input.add32(incomeValue);

        setMessage("Generating proof...");
        const encryptedData = await input.encrypt();

        setMessage("Updating...");
        const tx = await contractRef.current.updateIncome(
          encryptedData.handles[0],
          encryptedData.inputProof,
          label
        );

        setMessage("Waiting for confirmation...");
        const receipt = await tx.wait();

        // Save the updated value for Mock decryption
        const network = await signer.provider?.getNetwork();
        if (network?.chainId === BigInt(31337)) {
          // Save updated value for Mock mode decryption
          localStorage.setItem(`mock_income_${userAddress}`, incomeValue.toString());
          console.log("[usePrivatePayRank] Saved updated income for Mock decryption:", incomeValue);
        }

        setMessage("Income updated successfully!");
        console.log("[usePrivatePayRank] Income updated:", receipt.hash);

        await refreshData();

        return receipt;
      } catch (error: any) {
        console.error("[usePrivatePayRank] Update failed:", error);
        setMessage(`Failed to update: ${error.message}`);
        throw error;
      } finally {
        setIsSubmitting(false);
      }
    },
    [instance, signer, refreshData]
  );

  // Decrypt user's income
  const decryptUserIncome = useCallback(async () => {
    if (!instance || !signer || !addressRef.current || !userIncomeHandle) {
      throw new Error("Cannot decrypt");
    }

    setIsDecrypting(true);
    setMessage("Preparing to decrypt...");

    try {
      // Check if we're in mock mode (chainId 31337)
      const userAddress = await signer.getAddress();
      const network = await signer.provider?.getNetwork();
      const isMockMode = network?.chainId === BigInt(31337);

      console.log("[usePrivatePayRank] Decrypt mode:", isMockMode ? "Mock" : "Real");

      // 统一的解密流程（Mock和Real模式都使用相同的签名过程）
      setMessage("创建解密签名...");
      
      console.log("[usePrivatePayRank] 开始解密流程");
      
      // 创建解密签名（Mock和Real模式都需要）
      const sig = await FhevmDecryptionSignature.loadOrSign(
        instance,
        [addressRef.current],
        signer,
        storage
      );

      if (!sig) {
        throw new Error("无法创建解密签名");
      }

      setMessage("正在解密收入数据...");

      // 调用userDecrypt（Mock和Real模式都使用相同的接口）
      const result = await instance.userDecrypt(
        [{ handle: userIncomeHandle, contractAddress: addressRef.current }],
        sig.privateKey,
        sig.publicKey,
        sig.signature,
        sig.contractAddresses,
        sig.userAddress,
        sig.startTimestamp,
        sig.durationDays
      );

      const decrypted = Number(result[userIncomeHandle]);
      setDecryptedIncome(decrypted);
      
      const modeLabel = isMockMode ? "（本地测试模式）" : "";
      setMessage(`收入解密成功！${modeLabel}`);

      console.log(`[usePrivatePayRank] 解密成功 ${isMockMode ? '(Mock)' : '(Real)'}:`, decrypted);
      return decrypted;
    } catch (error: any) {
      console.error("[usePrivatePayRank] Decrypt failed:", error);
      setMessage(`Failed to decrypt: ${error.message}`);
      throw error;
    } finally {
      setIsDecrypting(false);
    }
  }, [instance, signer, userIncomeHandle]);

  // Set average (owner only)
  const setAverageValue = useCallback(
    async (value: number) => {
      if (!contractRef.current) {
        throw new Error("Contract not initialized");
      }

      setIsLoading(true);
      try {
        const tx = await contractRef.current.setAverage(value);
        await tx.wait();
        await refreshData();
      } catch (error) {
        console.error("[usePrivatePayRank] Set average failed:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [refreshData]
  );

  // Set distribution (owner only)
  const setDistributionValue = useCallback(
    async (dist: number[]) => {
      if (!contractRef.current) {
        throw new Error("Contract not initialized");
      }

      setIsLoading(true);
      try {
        const tx = await contractRef.current.setDistribution(dist);
        await tx.wait();
        await refreshData();
      } catch (error) {
        console.error("[usePrivatePayRank] Set distribution failed:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [refreshData]
  );

  // Calculate and set REAL statistics from actual user data
  const calculateRealStatistics = useCallback(async () => {
    if (!contractRef.current || !instance || !signer) {
      throw new Error("Not ready to calculate");
    }

    setIsLoading(true);
    setMessage("Checking permissions...");

    try {
      console.log("[usePrivatePayRank] Starting REAL statistics calculation...");
      
      // Check if current user is the contract owner
      const userAddress = await signer.getAddress();
      const contractOwner = await contractRef.current.owner();
      
      console.log("[usePrivatePayRank] User address:", userAddress);
      console.log("[usePrivatePayRank] Contract owner:", contractOwner);
      
      if (userAddress.toLowerCase() !== contractOwner.toLowerCase()) {
        // Not the owner, provide helpful message
        const ownerAccount = contractOwner === "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266" ? " (Hardhat Account #0)" : "";
        const errorMsg = `Only contract owner can calculate statistics. Owner: ${contractOwner}${ownerAccount}. Please switch to the owner account in MetaMask.`;
        
        setMessage(errorMsg);
        console.log("[usePrivatePayRank] Permission denied:", errorMsg);
        return;
      }
      
      setMessage("Permission verified. Gathering submission data...");
      
      // Get total submissions to know how many users to check
      const totalSubs = await contractRef.current.getTotalSubmissions();
      console.log("[usePrivatePayRank] Total submissions:", totalSubs.toString());
      
      if (totalSubs === 0) {
        setMessage("No submissions found. Cannot calculate statistics.");
        return;
      }
      
      // Check if we're in Mock mode for different handling
      const network = await signer.provider?.getNetwork();
      const isMockMode = network?.chainId === BigInt(31337);
      
      if (isMockMode) {
        setMessage("Mock模式：从本地存储收集真实数据...");
        
        // In Mock mode, collect all real submitted values from localStorage
        const mockIncomes: number[] = [];
        
        // Look for all mock income data in localStorage
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('mock_income_')) {
            const income = localStorage.getItem(key);
            if (income) {
              const incomeValue = parseInt(income);
              mockIncomes.push(incomeValue);
              console.log(`[usePrivatePayRank] Found stored income: ${incomeValue} from ${key}`);
            }
          }
        }
        
        if (mockIncomes.length === 0) {
          setMessage("Mock模式：未找到存储的收入数据。请先提交一些收入数据。");
          return;
        }
        
        console.log("[usePrivatePayRank] All stored incomes:", mockIncomes);
        
        // Calculate REAL average
        const realAverage = Math.round(mockIncomes.reduce((sum, income) => sum + income, 0) / mockIncomes.length);
        
        // Calculate REAL distribution
        const ranges = [
          { min: 0, max: 3000 },      // Range 0: 0-3k
          { min: 3001, max: 5000 },   // Range 1: 3k-5k  
          { min: 5001, max: 8000 },   // Range 2: 5k-8k
          { min: 8001, max: 12000 },  // Range 3: 8k-12k
          { min: 12001, max: 20000 }, // Range 4: 12k-20k
          { min: 20001, max: Infinity } // Range 5: 20k+
        ];
        
        const realDistribution = ranges.map(range => 
          mockIncomes.filter(income => income >= range.min && income <= range.max).length
        );
        
        console.log("[usePrivatePayRank] REAL average:", realAverage);
        console.log("[usePrivatePayRank] REAL distribution:", realDistribution);
        
        setMessage("设置真实平均收入...");
        const avgTx = await contractRef.current.setAverage(realAverage);
        await avgTx.wait();
        
        setMessage("设置真实收入分布...");
        const distTx = await contractRef.current.setDistribution(realDistribution);
        await distTx.wait();
        
        setMessage(`统计计算完成！基于 ${mockIncomes.length} 个真实提交的数据。平均收入: $${realAverage.toLocaleString()}`);
        
      } else {
        // Real mode: Would need to decrypt all user data (complex)
        setMessage("真实网络模式：统计计算需要解密所有用户数据...");
        
        // This is complex in real FHEVM because:
        // 1. We need to get all user addresses who submitted
        // 2. We need to decrypt their data (requires proper authorization)
        // 3. Calculate statistics from decrypted values
        
        // For now, provide a clear message about the limitation
        setMessage("真实网络模式下的统计计算需要复杂的权限管理。当前版本使用Mock模式测试真实数据计算功能。");
        return;
      }
      
      // Refresh to show new data
      await refreshData();
      
    } catch (error: any) {
      console.error("[usePrivatePayRank] Calculate statistics failed:", error);
      
      if (error.message.includes("Unauthorized") || error.data === "0x82b42900") {
        setMessage("权限被拒绝：只有合约所有者可以计算统计数据。请切换到所有者账户。");
      } else {
        setMessage(`计算失败: ${error.message}`);
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [instance, signer, refreshData]);

  // Auto-refresh on mount
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  return {
    // State
    isSubmitting,
    isDecrypting,
    isLoading,
    message,
    
    // Data
    totalSubmissions,
    averageIncome,
    distribution,
    hasSubmitted,
    userLabel,
    decryptedIncome,
    contractAddress: addressRef.current,
    
    // Actions
    submitIncome,
    updateIncome,
    decryptUserIncome,
    refreshData,
    setAverageValue,
    setDistributionValue,
    calculateRealStatistics,
    
    // Computed
    canSubmit: !isSubmitting && !hasSubmitted && instance !== null,
    canUpdate: !isSubmitting && hasSubmitted && instance !== null,
    canDecrypt: !isDecrypting && hasSubmitted && userIncomeHandle !== null,
  };
}





