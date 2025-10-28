// 使用真实的FHEVM SDK类型，避免自定义不兼容的类型
export type FhevmInstance = any; // 在Mock模式下是MockFhevmInstance，在真实模式下是Relayer SDK的FhevmInstance

export type FhevmInstanceConfig = {
  network: any;
  publicKey: string;
  publicParams: string;
  aclContractAddress: string;
  kmsVerifierAddress: string;
};

export type FhevmRelayerSDKType = {
  initSDK: (options?: any) => Promise<boolean>;
  createInstance: (config: FhevmInstanceConfig) => Promise<FhevmInstance>;
  SepoliaConfig: {
    aclContractAddress: string;
    kmsVerifierAddress: string;
  };
  __initialized__?: boolean;
};

export type FhevmWindowType = {
  relayerSDK: FhevmRelayerSDKType;
};

export type FhevmInitSDKOptions = Record<string, unknown>;

export type FhevmLoadSDKType = () => Promise<void>;

export type FhevmInitSDKType = (options?: FhevmInitSDKOptions) => Promise<boolean>;





