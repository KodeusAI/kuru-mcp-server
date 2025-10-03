# Deployment Guide

## 🚀 Quick Start

This deployment folder contains all the necessary files for uploading to Git and deploying the Kuru Exchange MCP Server.

### Files Included

```
kuru-mcp-server-deployment/
├── src/                    # Source code
├── build/                  # Compiled JavaScript (run `npm run build`)
├── package.json            # Dependencies and scripts
├── package-lock.json       # Lock file for exact versions
├── tsconfig.json           # TypeScript configuration
├── start.sh               # Startup script
├── env.example            # Environment variables template
├── .gitignore             # Git ignore rules
├── LICENSE                # MIT License with Kodeus attribution
├── README.md              # Complete documentation with Kodeus branding
└── DEPLOYMENT.md          # This file
```

## 📦 Deployment Steps

### 1. Build the Project

```bash
npm install
npm run build
```

### 2. Test the Server

```bash
# Test with environment variables
PRIVATE_KEY=your_key KURU_API_URL=https://api.testnet.kuru.io RPC_URL=https://rpc.ankr.com/monad_testnet npm start
```

### 3. Git Upload

```bash
git init
git add .
git commit -m "Initial commit: Kuru Exchange MCP Server by KodeusAI"
git remote add origin https://github.com/KodeusAI/kuru-mcp-server.git
git push -u origin main
```

## 🔧 Configuration

### Environment Variables

Copy `env.example` to `.env` and fill in your values:

```bash
cp env.example .env
# Edit .env with your actual values
```

### Claude Desktop Integration

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "kuru-exchange": {
      "command": "node",
      "args": ["<path-to-build>/build/index.js"],
      "env": {
        "KURU_API_URL": "https://api.testnet.kuru.io",
        "RPC_URL": "https://rpc.ankr.com/monad_testnet",
        "PRIVATE_KEY": "<your-private-key>"
      }
    }
  }
}
```

## 🏷️ Kodeus Branding

This project includes comprehensive Kodeus.ai branding:

- **README.md**: Full Kodeus branding with logo and company information
- **package.json**: Kodeus author information and repository links
- **LICENSE**: MIT license with Kodeus attribution
- **Documentation**: References to Kodeus ecosystem and $KODE tokens

### Branding Elements Added

1. **Company Logo**: Kodeus.ai logo in README
2. **Author Attribution**: Proper author field in package.json
3. **Repository Links**: GitHub repository and issue tracking
4. **Ecosystem Integration**: References to Kodeus features and benefits
5. **Token Utilities**: Information about $KODE token usage
6. **Developer SDK**: Links to Kodeus development resources

## 🔐 Security Notes

- Never commit private keys or sensitive data
- Use environment variables for all sensitive configuration
- Test on testnet only for development
- Keep your private key secure and never share it

## 📞 Support

For support and questions:
- **GitHub Organization**: https://github.com/KodeusAI
- **Email**: vamsi@kodeus.ai
- **GitHub Issues**: https://github.com/KodeusAI/kuru-mcp-server/issues

---

**Built with ❤️ by [KodeusAI](https://github.com/KodeusAI) - The Open Agentic Operating System**
