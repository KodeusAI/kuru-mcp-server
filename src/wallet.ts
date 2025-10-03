import { ethers } from "ethers";

// Utility function to normalize private key (handles both with and without 0x prefix)
function normalizePrivateKey(privateKey: string): string {
  if (!privateKey) {
    throw new Error("PRIVATE_KEY environment variable is required");
  }
  
  // Remove 0x prefix if present
  if (privateKey.startsWith('0x')) {
    return privateKey.slice(2);
  }
  
  return privateKey;
}

// Get private key from environment (no .env dependency)
const privateKey = process.env.PRIVATE_KEY;
if (!privateKey) {
  throw new Error("PRIVATE_KEY environment variable is required");
}

// Create wallet with normalized private key
const normalizedPrivateKey = normalizePrivateKey(privateKey);
const account = new ethers.Wallet(normalizedPrivateKey);

export { account };
