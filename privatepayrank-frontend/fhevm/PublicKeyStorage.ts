// Simple in-memory storage for public keys
const storage: Record<string, { publicKey: string; publicParams: string }> = {};

export async function publicKeyStorageGet(
  aclAddress: string
): Promise<{ publicKey: string; publicParams: string }> {
  // Return cached or generate default
  if (storage[aclAddress]) {
    return storage[aclAddress];
  }
  
  // Default empty values - will be set by createInstance
  return {
    publicKey: "",
    publicParams: "",
  };
}

export async function publicKeyStorageSet(
  aclAddress: string,
  publicKey: string,
  publicParams: string
): Promise<void> {
  storage[aclAddress] = { publicKey, publicParams };
}





