import { PoolFetcher, PathFinder, TokenSwap } from "@kuru-labs/kuru-sdk";
import { ethers } from "ethers";
import { getProvider, getSigner, getWalletAddress } from "../kuru/client.js";
import { getChainConfig } from "../config/chainConfig.js";

// Base tokens for common pairs (native token and stablecoins)
const BASE_TOKENS = {
  MONAD: {
    symbol: "MON",
    address: "0x0000000000000000000000000000000000000000" // Native token
  },
  USDC: {
    symbol: "USDC",
    address: "0xf817257fed379853cDe0fa4F97AB987181B1E5Ea" // USDC address (placeholder)
  },
  USDT: {
    symbol: "USDT", 
    address: "0x88b8E2161DEDC77EF4ab7585569D2415a1C1055D" // USDT address (placeholder)
  }
};

// Get all pools for a token pair
export async function getAllPools(
  tokenInAddress: string,
  tokenOutAddress: string,
  baseTokens: Array<{ symbol: string; address: string }> = Object.values(BASE_TOKENS)
): Promise<any[]> {
  try {
    const chainConfig = getChainConfig();
    const poolFetcher = await PoolFetcher.create(chainConfig.kuruApiUrl);
    
    const pools = await poolFetcher.getAllPools(
      tokenInAddress,
      tokenOutAddress,
      baseTokens
    );
    
    return pools;
  } catch (error) {
    throw new Error(`Failed to get pools: ${error}`);
  }
}

// Find the best path for a swap
export async function findBestPath(
  tokenInAddress: string,
  tokenOutAddress: string,
  amount: number,
  amountType: "amountIn" | "amountOut" = "amountIn",
  baseTokens: Array<{ symbol: string; address: string }> = Object.values(BASE_TOKENS)
): Promise<any> {
  try {
    const provider = getProvider();
    const chainConfig = getChainConfig();
    const poolFetcher = await PoolFetcher.create(chainConfig.kuruApiUrl);
    
    // Get all pools first
    const pools = await getAllPools(tokenInAddress, tokenOutAddress, baseTokens);
    
    if (!pools || pools.length === 0) {
      throw new Error("No pools found for the specified token pair");
    }
    
    // Find best path
    const bestPath = await PathFinder.findBestPath(
      provider,
      tokenInAddress,
      tokenOutAddress,
      amount,
      amountType,
      poolFetcher,
      pools
    );
    
    return bestPath;
  } catch (error) {
    throw new Error(`Failed to find best path: ${error}`);
  }
}

// Check token allowance
export async function checkTokenAllowance(
  tokenAddress: string,
  ownerAddress: string,
  spenderAddress: string
): Promise<{ allowance: string; needsApproval: boolean }> {
  try {
    const provider = getProvider();
    
    // ERC20 allowance interface
    const allowanceInterface = new ethers.utils.Interface([
      "function allowance(address owner, address spender) view returns (uint256)"
    ]);
    
    const tokenContract = new ethers.Contract(tokenAddress, allowanceInterface, provider);
    const allowance = await tokenContract.allowance(ownerAddress, spenderAddress);
    
    return {
      allowance: allowance.toString(),
      needsApproval: allowance.isZero()
    };
  } catch (error) {
    throw new Error(`Failed to check allowance: ${error}`);
  }
}

// Execute a token swap with automatic decimal detection and allowance checking
export async function executeSwap(
  tokenInAddress: string,
  tokenOutAddress: string,
  amount: number,
  onApproval?: (txHash: string | null) => void
): Promise<any> {
  try {
    const signer = getSigner();
    const chainConfig = getChainConfig();
    const walletAddress = getWalletAddress();
    
    // Get token information automatically
    const [tokenInInfo, tokenOutInfo] = await Promise.all([
      getTokenInfo(tokenInAddress),
      getTokenInfo(tokenOutAddress)
    ]);
    
    // Check if tokenIn is native token (0x0000...)
    const isNativeToken = tokenInAddress.toLowerCase() === "0x0000000000000000000000000000000000000000";
    
    let needsApproval = false;
    
    if (!isNativeToken) {
      // Check allowance for non-native tokens
      const allowanceInfo = await checkTokenAllowance(
        tokenInAddress,
        walletAddress,
        chainConfig.contracts.router
      );
      needsApproval = allowanceInfo.needsApproval;
    }
    
    // Find best path
    const bestPath = await findBestPath(tokenInAddress, tokenOutAddress, amount);
    
    if (!bestPath) {
      throw new Error("No valid path found for swap");
    }
    
    // Execute swap using the correct signature
    const receipt = await TokenSwap.swap(
      signer,
      chainConfig.contracts.router,
      bestPath,
      amount, // in number format
      tokenInInfo.decimals,
      tokenOutInfo.decimals,
      0.5, // slippageTolerance (0.5%)
      needsApproval, // automatically determine if approval is needed
      onApproval || ((txHash: string | null) => {
        console.error(`Transaction hash: ${txHash}`);
      })
    );
    
    // Log receipt details to stderr for debugging (not stdout)
    console.error(`Swap executed - Status: ${receipt.status}, Gas Used: ${receipt.gasUsed}`);
    
    // Ensure all values are JSON-serializable
    const serializableReceipt = {
      transactionHash: receipt.transactionHash?.toString() || null,
      status: receipt.status,
      gasUsed: receipt.gasUsed?.toString() || null,
      blockNumber: receipt.blockNumber?.toString() || null,
      blockHash: receipt.blockHash?.toString() || null,
      logs: receipt.logs || []
    };
    
    return {
      ...serializableReceipt,
      tokenInfo: {
        tokenIn: tokenInInfo,
        tokenOut: tokenOutInfo
      },
      allowanceInfo: {
        needsApproval,
        isNativeToken
      }
    };
  } catch (error) {
    throw new Error(`Failed to execute swap: ${error}`);
  }
}

// Get token information
export async function getTokenInfo(tokenAddress: string): Promise<any> {
  try {
    const provider = getProvider();
    const chainConfig = getChainConfig();
    
    // Check if it's native token
    const isNativeToken = tokenAddress.toLowerCase() === "0x0000000000000000000000000000000000000000";
    
    if (isNativeToken) {
      return {
        address: tokenAddress,
        name: chainConfig.nativeCurrency.name,
        symbol: chainConfig.nativeCurrency.symbol,
        decimals: chainConfig.nativeCurrency.decimals,
        totalSupply: "0", // Native tokens don't have total supply
        isNativeToken: true
      };
    }
    
    // Basic ERC20 token interface
    const tokenInterface = new ethers.utils.Interface([
      "function name() view returns (string)",
      "function symbol() view returns (string)",
      "function decimals() view returns (uint8)",
      "function totalSupply() view returns (uint256)"
    ]);
    
    const tokenContract = new ethers.Contract(tokenAddress, tokenInterface, provider);
    
    const [name, symbol, decimals, totalSupply] = await Promise.all([
      tokenContract.name(),
      tokenContract.symbol(),
      tokenContract.decimals(),
      tokenContract.totalSupply()
    ]);
    
    return {
      address: tokenAddress,
      name,
      symbol,
      decimals,
      totalSupply: totalSupply.toString(),
      isNativeToken: false
    };
  } catch (error) {
    throw new Error(`Failed to get token info: ${error}`);
  }
}

// Estimate swap output with automatic token info
export async function estimateSwapOutput(
  tokenInAddress: string,
  tokenOutAddress: string,
  amountIn: number,
  baseTokens: Array<{ symbol: string; address: string }> = Object.values(BASE_TOKENS)
): Promise<any> {
  try {
    // Get token information automatically
    const [tokenInInfo, tokenOutInfo] = await Promise.all([
      getTokenInfo(tokenInAddress),
      getTokenInfo(tokenOutAddress)
    ]);
    
    const bestPath = await findBestPath(tokenInAddress, tokenOutAddress, amountIn, "amountIn", baseTokens);
    
    if (!bestPath) {
      throw new Error("No valid path found for estimation");
    }
    
    return {
      tokenIn: tokenInAddress,
      tokenOut: tokenOutAddress,
      amountIn,
      estimatedAmountOut: bestPath.output || bestPath.amountOut,
      path: bestPath.route?.path || bestPath.path,
      pools: bestPath.pools,
      tokenInfo: {
        tokenIn: tokenInInfo,
        tokenOut: tokenOutInfo
      },
      priceImpact: bestPath.priceImpact,
      feeInBase: bestPath.feeInBase
    };
  } catch (error) {
    throw new Error(`Failed to estimate swap output: ${error}`);
  }
}

// Get available base tokens
export function getAvailableBaseTokens(): Array<{ symbol: string; address: string }> {
  return Object.values(BASE_TOKENS);
}

// Validate token addresses
export function validateTokenAddresses(tokenIn: string, tokenOut: string): boolean {
  return ethers.utils.isAddress(tokenIn) && ethers.utils.isAddress(tokenOut);
}

// Format amount with decimals
export function formatAmount(amount: number, decimals: number): string {
  return ethers.utils.parseUnits(amount.toString(), decimals).toString();
}

// Parse amount from wei
export function parseAmount(amount: string, decimals: number): number {
  return parseFloat(ethers.utils.formatUnits(amount, decimals));
}
