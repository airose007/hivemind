#!/bin/bash

# HiveMind Dashboard Startup Script

echo "🐝 Starting HiveMind Dashboard..."

cd "$(dirname "$0")"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if database is migrated
if [ ! -d "node_modules/.prisma" ]; then
    echo "🗄️  Running database migrations..."
    npx prisma generate
fi

# Start the application
echo "🚀 Starting server on http://localhost:3000"
echo "👤 Login: scott / HiveMind2026!"
echo ""

npm run dev
