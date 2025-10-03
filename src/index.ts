import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { account } from "./wallet.js";
import { validateEnvironment, getProvider, getSigner, getWalletAddress } from "./kuru/client.js";
import { getChainConfig, getSupportedChainNames } from "./config/chainConfig.js";
import { 
  getAllPools, 
  findBestPath, 
  executeSwap, 
  getTokenInfo, 
  estimateSwapOutput,
  getAvailableBaseTokens,
  validateTokenAddresses
} from "./tools/swapTools.js";

const server = new McpServer({
  name: "Kuru Exchange MCP",
  version: "1.0.0",
  description:
    "An MCP server for AI agents to interact with Kuru exchange operations using the Kuru SDK",
});

// Get Wallet Address Tool
server.tool(
  "getWalletAddress",
  "Get the wallet address derived from the private key in the environment variable",
  {},
  async () => {
    try {
      const validation = validateEnvironment();
      if (!validation.isValid) {
        return {
          content: [
            {
              type: "text",
              text: `❌ Environment validation failed:\n\n${validation.errors.join('\n')}\n\nRequired environment variables:\n• PRIVATE_KEY\n• KURU_API_URL\n• RPC_URL`,
            },
          ],
        };
      }

      const chainConfig = getChainConfig();
      
      return {
        content: [
          {
            type: "text",
            text: `💰 **Wallet Address:**\n\n• Address: ${account.address}\n• Derived from: PRIVATE_KEY environment variable\n• Chain: ${chainConfig.name} (${chainConfig.chainId})\n• RPC URL: ${chainConfig.rpcUrl}\n• Kuru API: ${chainConfig.kuruApiUrl}\n• Status: ✅ Ready for Kuru exchange operations\n\n💡 **Usage:** This address can be used for trading operations on Kuru exchange.\n\n🔗 **Common Token Addresses:**\n• **MON (Native):** 0x0000000000000000000000000000000000000000\n• **USDC:** 0xf817257fed379853cDe0fa4F97AB987181B1E5Ea`,
          },
        ],
      };
    } catch (e) {
      return {
        content: [
          {
            type: "text",
            text: `❌ Failed to get wallet address: ${e}`,
          },
        ],
      };
    }
  }
);



// Get Chain Info Tool
server.tool(
  "getChainInfo",
  "Get information about the configured blockchain network",
  {},
  async () => {
    try {
      const chainConfig = getChainConfig();
      const supportedChains = getSupportedChainNames();
      
      return {
        content: [
          {
            type: "text",
            text: `🌐 **Chain Information**\n\n📋 **Current Chain:**\n• Name: ${chainConfig.name}\n• Chain ID: ${chainConfig.chainId}\n• Native Currency: ${chainConfig.nativeCurrency.name} (${chainConfig.nativeCurrency.symbol})\n• Explorer: ${chainConfig.explorerUrl}\n• RPC URL: ${chainConfig.rpcUrl}\n• Kuru API: ${chainConfig.kuruApiUrl}\n\n🏗️ **Contracts:**\n• Margin Account: ${chainConfig.contracts.marginAccount}\n• Router: ${chainConfig.contracts.router}\n\n💡 **Important Token Information:**\n• **MON** is the native token of Monad blockchain\n• **Native Token Address:** 0x0000000000000000000000000000000000000000\n• **USDC Address:** 0xf817257fed379853cDe0fa4F97AB987181B1E5Ea\n• **Native tokens (MON) don't require approval for swaps**\n• **ERC20 tokens (USDC) require approval before swapping**\n\n📚 **Supported Chains:**\n${supportedChains.map(chain => `• ${chain}`).join('\n')}`,
          },
        ],
      };
    } catch (e) {
      return {
        content: [
          {
            type: "text",
            text: `❌ Failed to get chain info: ${e}`,
          },
        ],
      };
    }
  }
);



// Get All Pools Tool
server.tool(
  "getAllPools",
  "Get all available pools for a token pair using PoolFetcher",
  {
    tokenIn: z.string().describe("Input token address"),
    tokenOut: z.string().describe("Output token address"),
  },
  async (params) => {
    try {
      const validation = validateEnvironment();
      if (!validation.isValid) {
        return {
          content: [
            {
              type: "text",
              text: `❌ Environment validation failed:\n\n${validation.errors.join('\n')}`,
            },
          ],
        };
      }

      if (!validateTokenAddresses(params.tokenIn, params.tokenOut)) {
        return {
          content: [
            {
              type: "text",
              text: `❌ Invalid token addresses provided`,
            },
          ],
        };
      }

      const pools = await getAllPools(params.tokenIn, params.tokenOut);
      
      return {
        content: [
          {
            type: "text",
            text: `🏊 **Available Pools Found**\n\n📋 **Token Pair:**\n• Token In: ${params.tokenIn}\n• Token Out: ${params.tokenOut}\n• Total Pools: ${pools.length}\n\n📊 **Pool Details:**\n${pools.map((pool, index) => `• Pool ${index + 1}: ${pool.baseToken} → ${pool.quoteToken} (Orderbook: ${pool.orderbook})`).join('\n')}`,
          },
        ],
      };
    } catch (e) {
      return {
        content: [
          {
            type: "text",
            text: `❌ Failed to get pools: ${e}`,
          },
        ],
      };
    }
  }
);

// Find Best Path Tool
server.tool(
  "findBestPath",
  "Find the best path for a token swap using PathFinder",
  {
    tokenIn: z.string().describe("Input token address"),
    tokenOut: z.string().describe("Output token address"),
    amount: z.number().describe("Amount to swap (in number format, not ERC20 decimals)"),
    amountType: z.enum(["amountIn", "amountOut"]).optional().describe("Type of amount (default: amountIn)"),
  },
  async (params) => {
    try {
      const validation = validateEnvironment();
      if (!validation.isValid) {
        return {
          content: [
            {
              type: "text",
              text: `❌ Environment validation failed:\n\n${validation.errors.join('\n')}`,
            },
          ],
        };
      }

      if (!validateTokenAddresses(params.tokenIn, params.tokenOut)) {
        return {
          content: [
            {
              type: "text",
              text: `❌ Invalid token addresses provided`,
            },
          ],
        };
      }

      const bestPath = await findBestPath(
        params.tokenIn, 
        params.tokenOut, 
        params.amount, 
        params.amountType || "amountIn"
      );
      
      return {
        content: [
          {
            type: "text",
            text: `🛣️ **Best Path Found**\n\n📋 **Swap Details:**\n• Token In: ${params.tokenIn}\n• Token Out: ${params.tokenOut}\n• Amount: ${params.amount}\n• Amount Type: ${params.amountType || "amountIn"}\n\n📊 **Path Information:**\n• Amount Out: ${bestPath.amountOut}\n• Path: ${bestPath.path?.join(' → ') || 'Direct'}\n• Pools Used: ${bestPath.pools?.length || 0}`,
          },
        ],
      };
    } catch (e) {
      return {
        content: [
          {
            type: "text",
            text: `❌ Failed to find best path: ${e}`,
          },
        ],
      };
    }
  }
);

// Estimate Swap Output Tool
server.tool(
  "estimateSwapOutput",
  "Estimate the output amount for a token swap",
  {
    tokenIn: z.string().describe("Input token address"),
    tokenOut: z.string().describe("Output token address"),
    amountIn: z.number().describe("Input amount (in number format, not ERC20 decimals)"),
  },
  async (params) => {
    try {
      const validation = validateEnvironment();
      if (!validation.isValid) {
        return {
          content: [
            {
              type: "text",
              text: `❌ Environment validation failed:\n\n${validation.errors.join('\n')}`,
            },
          ],
        };
      }

      if (!validateTokenAddresses(params.tokenIn, params.tokenOut)) {
        return {
          content: [
            {
              type: "text",
              text: `❌ Invalid token addresses provided`,
            },
          ],
        };
      }

      const estimation = await estimateSwapOutput(params.tokenIn, params.tokenOut, params.amountIn);
      
      return {
        content: [
          {
            type: "text",
            text: `📊 **Swap Estimation**\n\n📋 **Swap Details:**\n• Token In: ${params.tokenIn}\n• Token Out: ${params.tokenOut}\n• Amount In: ${params.amountIn}\n\n💰 **Estimation Results:**\n• Estimated Amount Out: ${estimation.estimatedAmountOut}\n• Path: ${estimation.path?.join(' → ') || 'Direct'}\n• Pools Used: ${estimation.pools?.length || 0}`,
          },
        ],
      };
    } catch (e) {
      return {
        content: [
          {
            type: "text",
            text: `❌ Failed to estimate swap output: ${e}`,
          },
        ],
      };
    }
  }
);

// Execute Swap Tool
server.tool(
  "executeSwap",
  "Execute a token swap using the router contract with automatic decimal detection and allowance checking",
  {
    tokenIn: z.string().describe("Input token address"),
    tokenOut: z.string().describe("Output token address"),
    amount: z.number().describe("Amount to swap (in number format, not ERC20 decimals)"),
  },
  async (params) => {
    try {
      const validation = validateEnvironment();
      if (!validation.isValid) {
        return {
          content: [
            {
              type: "text",
              text: `❌ Environment validation failed:\n\n${validation.errors.join('\n')}`,
            },
          ],
        };
      }

      if (!validateTokenAddresses(params.tokenIn, params.tokenOut)) {
        return {
          content: [
            {
              type: "text",
              text: `❌ Invalid token addresses provided`,
            },
          ],
        };
      }

      let approvalTxHash: string | null = null;
      
      const result = await executeSwap(
        params.tokenIn,
        params.tokenOut,
        params.amount,
        (txHash: string | null) => {
          approvalTxHash = txHash;
        }
      );
      
      const isNativeToken = result.allowanceInfo.isNativeToken;
      const needsApproval = result.allowanceInfo.needsApproval;
      
      return {
        content: [
          {
            type: "text",
            text: `✅ **Swap Executed Successfully**\n\n📋 **Swap Details:**\n• Token In: ${params.tokenIn} (${result.tokenInfo.tokenIn.symbol})\n• Token Out: ${params.tokenOut} (${result.tokenInfo.tokenOut.symbol})\n• Amount: ${params.amount}\n• Token In Decimals: ${result.tokenInfo.tokenIn.decimals}\n• Token Out Decimals: ${result.tokenInfo.tokenOut.decimals}\n\n🔐 **Allowance Info:**\n• Is Native Token: ${isNativeToken ? 'Yes' : 'No'}\n• Needs Approval: ${needsApproval ? 'Yes' : 'No'}\n\n🔗 **Transaction Details:**\n• Approval TX Hash: ${approvalTxHash || 'N/A'}\n• Swap TX Hash: ${result.transactionHash || 'N/A'}\n• Gas Used: ${result.gasUsed?.toString() || 'N/A'}\n• Status: ${result.status === 1 ? 'Success' : 'Failed'}`,
          },
        ],
      };
    } catch (e) {
      return {
        content: [
          {
            type: "text",
            text: `❌ Failed to execute swap: ${e}`,
          },
        ],
      };
    }
  }
);

// Get Token Info Tool
server.tool(
  "getTokenInfo",
  "Get detailed information about an ERC20 token",
  {
    tokenAddress: z.string().describe("Token contract address"),
  },
  async (params) => {
    try {
      const validation = validateEnvironment();
      if (!validation.isValid) {
        return {
          content: [
            {
              type: "text",
              text: `❌ Environment validation failed:\n\n${validation.errors.join('\n')}`,
            },
          ],
        };
      }

      if (!validateTokenAddresses(params.tokenAddress, params.tokenAddress)) {
        return {
          content: [
            {
              type: "text",
              text: `❌ Invalid token address provided`,
            },
          ],
        };
      }

      const tokenInfo = await getTokenInfo(params.tokenAddress);
      
      return {
        content: [
          {
            type: "text",
            text: `🪙 **Token Information**\n\n📋 **Token Details:**\n• Address: ${tokenInfo.address}\n• Name: ${tokenInfo.name}\n• Symbol: ${tokenInfo.symbol}\n• Decimals: ${tokenInfo.decimals}\n• Total Supply: ${tokenInfo.totalSupply}`,
          },
        ],
      };
    } catch (e) {
      return {
        content: [
          {
            type: "text",
            text: `❌ Failed to get token info: ${e}`,
          },
        ],
      };
    }
  }
);

// Get Available Base Tokens Tool
server.tool(
  "getAvailableBaseTokens",
  "Get list of available base tokens for pool creation",
  {},
  async () => {
    try {
      const baseTokens = getAvailableBaseTokens();
      
      return {
        content: [
          {
            type: "text",
            text: `🪙 **Available Base Tokens**\n\n📋 **Base Tokens:**\n${baseTokens.map(token => `• ${token.symbol}: ${token.address}`).join('\n')}\n\n💡 **Usage:** These tokens are commonly used as base pairs for liquidity pools.`,
          },
        ],
      };
    } catch (e) {
      return {
        content: [
          {
            type: "text",
            text: `❌ Failed to get base tokens: ${e}`,
          },
        ],
      };
    }
  }
);



async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  // Validate environment on startup
  const validation = validateEnvironment();
  const chainConfig = getChainConfig();
  
  // All logging must go to stderr to avoid interfering with MCP protocol
  console.error(`Kuru Exchange MCP Server v1.0.0 running on stdio`);
  console.error(`Wallet Address: ${account.address}`);
  console.error(`Chain: ${chainConfig.name} (${chainConfig.chainId})`);
  console.error(`RPC URL: ${chainConfig.rpcUrl}`);
  console.error(`Kuru API: ${chainConfig.kuruApiUrl}`);
  
  if (validation.isValid) {
    console.error(`Status: ✅ Environment validated - Ready for Kuru exchange operations`);
  } else {
    console.error(`Status: ⚠️ Environment validation failed - Some tools may not work`);
    console.error(`Errors: ${validation.errors.join(', ')}`);
  }
}

// Ensure stdout is only used for MCP protocol communication
process.stdout.on('error', (err) => {
  console.error('STDOUT Error:', err);
});

// Override console.log to prevent stdout pollution
const originalConsoleLog = console.log;
console.log = (...args) => {
  console.error('[REDIRECTED FROM STDOUT]:', ...args);
};

main().catch((error) => {
  console.error("Fatal error in Kuru Exchange MCP main():", error);
  process.exit(1);
});
