# Kuru Exchange MCP Server

<div align="center">
  <img src="./logo.svg" alt="Kodeus Logo" width="200"/>
  
  **Built by [KodeusAI](https://github.com/KodeusAI) - The Open Agentic Operating System**
  
  *Built for Real Work, On-chain*
</div>

---

A Model Context Protocol (MCP) server for interacting with Kuru exchange operations using the Kuru SDK. This server enables AI agents to perform DeFi trading operations on the Monad blockchain through Claude Desktop integration.

## 🚀 Features

- **Kuru SDK Integration**: Full integration with @kuru-labs/kuru-sdk
- **Wallet Management**: Get wallet address from private key
- **Environment Validation**: Validate required environment variables
- **Chain Configuration**: Support for Monad blockchain
- **Secure**: No .env file dependency - uses environment variables directly
- **AI Agent Ready**: Seamless integration with Claude Desktop

## 🏗️ Built by KodeusAI

This MCP server is developed by [KodeusAI](https://github.com/KodeusAI), the Open Agentic Operating System that turns user intent into real, on-chain execution. Kodeus empowers users to create, deploy, and evolve intelligent agents that operate seamlessly across on-chain & off-chain stacks.

**Key Kodeus Features:**
- 🧠 **Composable Agent Framework**: Modular, decentralized framework for real agents
- 🔗 **Web3 Integration**: Seamless integration with leading Web3 protocols
- 💰 **Build & Earn**: Monetize your agent contributions with $KODE tokens
- 🛠️ **Developer SDK**: Build custom MCP modules and workflows

## 📦 Setup

### Prerequisites

- Node.js >= 18.0.0
- npm or yarn

### Installation

1. Clone or navigate to the project directory:
```bash
cd kuru-mcp-server
```

2. Install dependencies:
```bash
npm install
```

3. Set required environment variables when running the server:
```bash
PRIVATE_KEY=your_private_key_here
KURU_API_URL=https://api.testnet.kuru.io
RPC_URL=https://rpc.ankr.com/monad_testnet
```

**Important**: Replace the values with your actual configuration.

### Building

Build the TypeScript project:
```bash
npm run build
```

### Running

Start the MCP server with environment variables:
```bash
PRIVATE_KEY=your_private_key KURU_API_URL=https://api.testnet.kuru.io RPC_URL=https://rpc.ankr.com/monad_testnet npm start
```

Or use the start script:
```bash
PRIVATE_KEY=your_private_key KURU_API_URL=https://api.testnet.kuru.io RPC_URL=https://rpc.ankr.com/monad_testnet ./start.sh
```

## 🤖 Claude Desktop Integration

### Setup for Claude Desktop

To use this MCP server with Claude Desktop, add the following configuration to your Claude Desktop settings:

1. **Open Claude Desktop Settings**
   - On macOS: `Claude Desktop` → `Preferences` → `Advanced`
   - On Windows: `File` → `Settings` → `Advanced`

2. **Add MCP Server Configuration**
   Add this configuration to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "kuru-exchange": {
      "command": "node",
      "args": [
        "<Path to MCP>/build/index.js"
      ],
      "env": {
        "KURU_API_URL": "https://api.testnet.kuru.io",
        "RPC_URL": "https://rpc.ankr.com/monad_testnet",
        "PRIVATE_KEY": "<Your Wallet Private Key>"
      }
    }
  }
}
```

3. **Replace Placeholders**
   - `<Path to MCP>`: Full path to your kuru-mcp-server directory
   - `<Your Wallet Private Key>`: Your actual private key (keep this secure!)

4. **Example Configuration**
```json
{
  "mcpServers": {
    "kuru-exchange": {
      "command": "node",
      "args": [
        "/Users/username/kuru-mcp-server/build/index.js"
      ],
      "env": {
        "KURU_API_URL": "https://api.testnet.kuru.io",
        "RPC_URL": "https://rpc.ankr.com/monad_testnet",
        "PRIVATE_KEY": "0x1234567890abcdef..."
      }
    }
  }
}
```

5. **Restart Claude Desktop**
   - Close and reopen Claude Desktop for the changes to take effect

6. **Verify Connection**
   - In Claude Desktop, you should see "kuru-exchange" available as a tool
   - Test with: "What's my wallet address?" or "Get chain information"

### Security Notes for Claude Desktop

- **Never share your private key** - Keep it secure
- **Use testnet only** - This is for testing purposes
- **Backup your configuration** - Keep a secure backup of your config
- **Monitor transactions** - Always verify transactions before confirming

## 🛠️ Available Tools

### getWalletAddress

Gets the wallet address derived from the private key stored in the `PRIVATE_KEY` environment variable.

**Parameters**: None

**Example Response**:
```
💰 Wallet Address:

• Address: 0x1234567890abcdef...
• Derived from: PRIVATE_KEY environment variable
• Chain: Monad Testnet (10143)
• RPC URL: https://rpc.ankr.com/monad_testnet
• Kuru API: https://api.testnet.kuru.io
• Status: ✅ Ready for Kuru exchange operations

💡 Usage: This address can be used for trading operations on Kuru exchange.
```

### getChainInfo

Get information about the configured blockchain network.

**Parameters**: None

### getAllPools

Get all available pools for a token pair using PoolFetcher.

**Parameters**:
- `tokenIn` (string): Input token address
- `tokenOut` (string): Output token address

### findBestPath

Find the best path for a token swap using PathFinder.

**Parameters**:
- `tokenIn` (string): Input token address
- `tokenOut` (string): Output token address
- `amount` (number): Amount to swap (in number format, not ERC20 decimals)
- `amountType` (string, optional): Type of amount: 'amountIn' or 'amountOut' (default: amountIn)

### estimateSwapOutput

Estimate the output amount for a token swap.

**Parameters**:
- `tokenIn` (string): Input token address
- `tokenOut` (string): Output token address
- `amountIn` (number): Input amount (in number format, not ERC20 decimals)

### executeSwap

Execute a token swap using the router contract with automatic decimal detection and allowance checking.

**Parameters**:
- `tokenIn` (string): Input token address
- `tokenOut` (string): Output token address
- `amount` (number): Amount to swap (in number format, not ERC20 decimals)

### getTokenInfo

Get detailed information about an ERC20 token.

**Parameters**:
- `tokenAddress` (string): Token contract address

### getAvailableBaseTokens

Get list of available base tokens for pool creation.

**Parameters**: None

## 🌐 Supported Networks

- **Monad Testnet** (Chain ID: 10143) - Currently the only available network
  - Explorer: https://testnet.monadexplorer.com
  - RPC: https://rpc.ankr.com/monad_testnet
  - Status: ✅ Active Testnet

## 🔧 Development

### Development Mode

Run in development mode with TypeScript compilation watching for changes:
```bash
npm run dev
```

### Testing

Run tests:
```bash
npm test
```

## 📋 Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `PRIVATE_KEY` | Private key for wallet operations | Yes | - |
| `KURU_API_URL` | Kuru API endpoint URL | Yes | - |
| `RPC_URL` | Blockchain RPC endpoint URL | Yes | - |
| `CHAIN_ID` | Chain ID (optional) | No | 10143 |

## 🔐 Security Notes

- No .env file dependency - environment variables are passed directly
- Keep your private key secure and never share it
- The private key is only used to derive the wallet address and initialize the Kuru client
- All sensitive data is handled securely through environment variables

## 🤝 Contributing

This project is part of the Kodeus ecosystem. To contribute:

1. **Build Custom MCP Modules**: Develop and host MCP-compliant servers
2. **Agent Development**: Use the Kodeus Developer SDK to build intelligent agents
3. **Community**: Join the Kodeus community and earn $KODE tokens for contributions

Learn more at [KodeusAI](https://github.com/KodeusAI)

## 📄 License

MIT

---

<div align="center">
  <p><strong>Built with ❤️ by <a href="https://github.com/KodeusAI">KodeusAI</a></strong></p>
  <p>The Open Agentic Operating System for Web3</p>
</div>
