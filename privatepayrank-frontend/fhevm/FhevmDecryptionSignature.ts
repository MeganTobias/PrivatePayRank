import { ethers } from "ethers";
import type { FhevmInstance } from "./fhevmTypes";

export type GenericStringStorage = {
  get: (key: string) => string | null;
  set: (key: string, value: string) => void;
};

export class FhevmDecryptionSignature {
  public privateKey: string;
  public publicKey: string;
  public signature: string;
  public contractAddresses: string[];
  public userAddress: string;
  public startTimestamp: number;
  public durationDays: number;

  constructor(
    privateKey: string,
    publicKey: string,
    signature: string,
    contractAddresses: string[],
    userAddress: string,
    startTimestamp: number,
    durationDays: number
  ) {
    this.privateKey = privateKey;
    this.publicKey = publicKey;
    this.signature = signature;
    this.contractAddresses = contractAddresses;
    this.userAddress = userAddress;
    this.startTimestamp = startTimestamp;
    this.durationDays = durationDays;
  }

  static async loadOrSign(
    instance: FhevmInstance,
    contractAddresses: string[],
    signer: ethers.Signer,
    storage: GenericStringStorage,
    keyPair?: { publicKey: string; privateKey: string }
  ): Promise<FhevmDecryptionSignature | null> {
    const userAddress = await signer.getAddress();
    const storageKey = `fhevm.decryptionSignature.${userAddress}`;

    // Try to load from storage
    const stored = storage.get(storageKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (
          parsed.userAddress === userAddress &&
          JSON.stringify(parsed.contractAddresses.sort()) ===
            JSON.stringify(contractAddresses.sort())
        ) {
          return new FhevmDecryptionSignature(
            parsed.privateKey,
            parsed.publicKey,
            parsed.signature,
            parsed.contractAddresses,
            parsed.userAddress,
            parsed.startTimestamp,
            parsed.durationDays
          );
        }
      } catch (e) {
        console.warn("Failed to load stored signature:", e);
      }
    }

    // Generate new signature - 使用参考项目的方式
    try {
      // 使用 generateKeypair() 而不是 getPublicKey()
      const { publicKey, privateKey } = keyPair ?? instance.generateKeypair();

      const startTimestamp = Math.floor(Date.now() / 1000);
      const durationDays = 365; // 使用与参考项目相同的天数

      // 使用FHEVM实例的createEIP712方法（与参考项目一致）
      const eip712 = instance.createEIP712(
        publicKey,
        contractAddresses,
        startTimestamp,
        durationDays
      );

      const signature = await signer.signTypedData(
        eip712.domain,
        { UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification },
        eip712.message
      );

      const sig = new FhevmDecryptionSignature(
        privateKey,
        publicKey,
        signature,
        contractAddresses,
        userAddress,
        startTimestamp,
        durationDays
      );

      // Store for future use
      storage.set(storageKey, JSON.stringify(sig));

      return sig;
    } catch (e) {
      console.error("Failed to generate signature:", e);
      return null;
    }
  }
}





