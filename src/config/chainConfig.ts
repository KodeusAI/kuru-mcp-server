// Chain configuration for Kuru MCP Server

export interface ChainConfig {
  chainId: number;
  name: string;
  rpcUrl: string;
  explorerUrl: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  contracts: {
    marginAccount: string;
    router: string;
    orderBookFactory: string;
    tokenFactory: string;
  };
  routerAddress: string;
  kuruApiUrl: string;
}

// Monad Mainnet Configuration
export const MONAD_MAINNET: ChainConfig = {
  chainId: 10143,
  name: "Monad",
  rpcUrl: process.env['RPC_URL'] || "https://rpc.monad.xyz",
  explorerUrl: "https://explorer.monad.xyz",
  nativeCurrency: {
    name: "Monad",
    symbol: "MON",
    decimals: 18,
  },
  contracts: {
    marginAccount: process.env['MARGIN_ACCOUNT_ADDRESS'] || "0x4B186949F31FCA0aD08497Df9169a6bEbF0e26ef",
    router: process.env['ROUTER_ADDRESS'] || "0xc816865f172d640d93712C68a7E1F83F3fA63235",
    orderBookFactory: "0x0000000000000000000000000000000000000000", // TBD
    tokenFactory: "0x0000000000000000000000000000000000000000", // TBD
  },
  routerAddress: process.env['ROUTER_ADDRESS'] || "0xc816865f172d640d93712C68a7E1F83F3fA63235",
  kuruApiUrl: process.env['KURU_API_URL'] || "https://api.testnet.kuru.io",
};

// Monad Testnet Configuration
export const MONAD_TESTNET: ChainConfig = {
  chainId: 10143, // Monad testnet chain ID
  name: "Monad Testnet",
  rpcUrl: process.env['RPC_URL'] || "https://rpc.ankr.com/monad_testnet",
  explorerUrl: "https://testnet.monadexplorer.com",
  nativeCurrency: {
    name: "Monad Testnet",
    symbol: "MON",
    decimals: 18,
  },
  contracts: {
    marginAccount: process.env['MARGIN_ACCOUNT_ADDRESS'] || "0x4B186949F31FCA0aD08497Df9169a6bEbF0e26ef",
    router: process.env['ROUTER_ADDRESS'] || "0xc816865f172d640d93712C68a7E1F83F3fA63235",
    orderBookFactory: "0x0000000000000000000000000000000000000000",
    tokenFactory: "0x0000000000000000000000000000000000000000",
  },
  routerAddress: process.env['ROUTER_ADDRESS'] || "0xc816865f172d640d93712C68a7E1F83F3fA63235",
  kuruApiUrl: process.env['KURU_API_URL'] || "https://api.testnet.kuru.io",
};

// Available chains
export const SUPPORTED_CHAINS: Record<number, ChainConfig> = {
  [MONAD_MAINNET.chainId]: MONAD_MAINNET,
  [MONAD_TESTNET.chainId]: MONAD_TESTNET,
};

// Default chain (can be overridden via environment variable)
export const DEFAULT_CHAIN_ID = parseInt(process.env['CHAIN_ID'] || '10143');

export function getChainConfig(chainId?: number): ChainConfig {
  const targetChainId = chainId || DEFAULT_CHAIN_ID;
  const config = SUPPORTED_CHAINS[targetChainId];
  
  if (!config) {
    throw new Error(`Unsupported chain ID: ${targetChainId}. Supported chains: ${Object.keys(SUPPORTED_CHAINS).join(', ')}`);
  }
  
  return config;
}

export function getChainConfigByName(chainName: string): ChainConfig {
  const chain = Object.values(SUPPORTED_CHAINS).find(
    config => config.name.toLowerCase() === chainName.toLowerCase()
  );
  
  if (!chain) {
    throw new Error(`Unsupported chain: ${chainName}. Supported chains: ${Object.values(SUPPORTED_CHAINS).map(c => c.name).join(', ')}`);
  }
  
  return chain;
}

// Helper function to validate chain ID
export function isValidChainId(chainId: number): boolean {
  return chainId in SUPPORTED_CHAINS;
}

// Get all supported chain names
export function getSupportedChainNames(): string[] {
  return Object.values(SUPPORTED_CHAINS).map(config => config.name);
}
