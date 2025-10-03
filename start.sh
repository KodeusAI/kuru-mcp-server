#!/bin/bash

# Kuru Exchange MCP Server Start Script

echo "🚀 Starting Kuru Exchange MCP Server..."

# Check if required environment variables are set
if [ -z "$PRIVATE_KEY" ]; then
    echo "❌ Error: PRIVATE_KEY environment variable is required!"
    echo "Please set PRIVATE_KEY when running the server"
    echo "Example: PRIVATE_KEY=your_private_key KURU_API_URL=https://api.kuru.io RPC_URL=https://rpc.monad.xyz ./start.sh"
    exit 1
fi

if [ -z "$KURU_API_URL" ]; then
    echo "❌ Error: KURU_API_URL environment variable is required!"
    echo "Please set KURU_API_URL when running the server"
    exit 1
fi

if [ -z "$RPC_URL" ]; then
    echo "❌ Error: RPC_URL environment variable is required!"
    echo "Please set RPC_URL when running the server"
    exit 1
fi

# Check if build directory exists
if [ ! -d "build" ]; then
    echo "📦 Building project..."
    npm run build
fi

# Start the MCP server
echo "✅ Starting MCP server..."
echo "📋 Configuration:"
echo "  • Chain: Monad (10143)"
echo "  • RPC URL: $RPC_URL"
echo "  • Kuru API: $KURU_API_URL"
echo "  • Wallet: $(echo $PRIVATE_KEY | cut -c1-10)..."
node build/index.js
