"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { createFhevmInstance } from "@/fhevm/fhevm";
import type { FhevmInstance } from "@/fhevm/fhevmTypes";

interface UseFHEVMParams {
  provider: any;
  chainId: number | null;
  enabled?: boolean;
}

export function useFHEVM({ provider, chainId, enabled = true }: UseFHEVMParams) {
  const [instance, setInstance] = useState<FhevmInstance | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [status, setStatus] = useState<string>("idle");

  const abortControllerRef = useRef<AbortController | null>(null);
  const lastChainIdRef = useRef<number | null>(null);

  const createInstance = useCallback(async () => {
    if (!provider || !chainId || !enabled) {
      setInstance(null);
      return;
    }

    // Don't recreate if chain hasn't changed
    if (lastChainIdRef.current === chainId && instance) {
      return;
    }

    // Abort previous creation
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    lastChainIdRef.current = chainId;

    setIsLoading(true);
    setError(null);
    setStatus("creating");

    try {
      const fhevmInstance = await createFhevmInstance({
        provider,
        mockChains: { 31337: "http://localhost:8545" },
        signal: abortControllerRef.current.signal,
        onStatusChange: (newStatus) => {
          setStatus(newStatus);
          console.log("[useFHEVM] Status:", newStatus);
        },
      });

      if (!abortControllerRef.current.signal.aborted) {
        setInstance(fhevmInstance);
        setStatus("ready");
        console.log("[useFHEVM] Instance created for chain", chainId);
      }
    } catch (err: any) {
      if (err.name !== "FhevmAbortError") {
        console.error("[useFHEVM] Failed to create instance:", err);
        setError(err);
        setStatus("error");
      }
    } finally {
      if (!abortControllerRef.current?.signal.aborted) {
        setIsLoading(false);
      }
    }
  }, [provider, chainId, enabled, instance]);

  useEffect(() => {
    createInstance();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [createInstance]);

  return {
    instance,
    isLoading,
    error,
    status,
    isReady: status === "ready" && instance !== null,
  };
}





