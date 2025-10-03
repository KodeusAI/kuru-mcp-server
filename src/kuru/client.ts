import { ethers } from 'ethers';
import { getChainConfig } from '../config/chainConfig.js';

// Provider and signer instances
let provider: ethers.providers.JsonRpcProvider | null = null;
let signer: ethers.Signer | null = null;

// Initialize provider and signer with environment variables
export function initializeProvider(): ethers.providers.JsonRpcProvider {
  if (provider) {
    return provider;
  }

  // Get required environment variables
  const rpcUrl = process.env.RPC_URL;

  if (!rpcUrl) {
    throw new Error("RPC_URL environment variable is required");
  }

  // Get chain configuration
  const chainConfig = getChainConfig();

  // Create provider
  provider = new ethers.providers.JsonRpcProvider(rpcUrl, {
    chainId: chainConfig.chainId,
    name: chainConfig.name
  });

  return provider;
}

// Initialize signer
export function initializeSigner(): ethers.Signer {
  if (signer) {
    return signer;
  }

  // Get required environment variables
  const privateKey = process.env.PRIVATE_KEY;

  if (!privateKey) {
    throw new Error("PRIVATE_KEY environment variable is required");
  }

  // Create provider if not already created
  const provider = initializeProvider();

  // Create wallet
  signer = new ethers.Wallet(privateKey, provider);

  return signer;
}

// Get provider instance
export function getProvider(): ethers.providers.JsonRpcProvider {
  if (!provider) {
    return initializeProvider();
  }
  return provider;
}

// Get signer instance
export function getSigner(): ethers.Signer {
  if (!signer) {
    return initializeSigner();
  }
  return signer;
}

// Get wallet address
export function getWalletAddress(): string {
  const signer = getSigner();
  return (signer as ethers.Wallet).address;
}

// Validate environment variables
export function validateEnvironment(): {
  isValid: boolean;
  errors: string[];
  config: {
    privateKey: string;
    kuruApiUrl: string;
    rpcUrl: string;
    chainId: number;
  };
} {
  const errors: string[] = [];
  
  const privateKey = process.env.PRIVATE_KEY;
  const kuruApiUrl = process.env.KURU_API_URL;
  const rpcUrl = process.env.RPC_URL;

  if (!privateKey) {
    errors.push("PRIVATE_KEY environment variable is required");
  }

  if (!kuruApiUrl) {
    errors.push("KURU_API_URL environment variable is required");
  }

  if (!rpcUrl) {
    errors.push("RPC_URL environment variable is required");
  }

  let chainId = 10143; // Default to Monad
  try {
    const chainConfig = getChainConfig();
    chainId = chainConfig.chainId;
  } catch (error) {
    errors.push(`Chain configuration error: ${error}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    config: {
      privateKey: privateKey || "",
      kuruApiUrl: kuruApiUrl || "",
      rpcUrl: rpcUrl || "",
      chainId,
    },
  };
}

// Reset instances (useful for testing)
export function resetInstances(): void {
  provider = null;
  signer = null;
}
