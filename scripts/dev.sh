#!/bin/bash

echo "🚀 Starting GreenEnergy AI Development Server..."
echo ""

# Check if dependencies are installed
if [ ! -d "node_modules" ] || [ ! -d "apps/frontend/node_modules" ] || [ ! -d "apps/backend/node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm run install:all
fi

# Check if .env exists
if [ ! -f "apps/backend/.env" ]; then
    echo "📝 Creating backend .env file..."
    cp apps/backend/.env.example apps/backend/.env
fi

# Create uploads directory
if [ ! -d "apps/backend/uploads" ]; then
    echo "📁 Creating uploads directory..."
    mkdir -p apps/backend/uploads
fi

echo ""
echo "✨ Starting servers..."
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:3000"
echo ""

# Start development servers
npm run dev
