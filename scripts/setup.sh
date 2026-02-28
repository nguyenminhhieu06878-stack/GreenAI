#!/bin/bash

echo "🌱 Setting up GreenEnergy AI..."

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18 or higher is required"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install dependencies
echo "📦 Installing dependencies..."
npm run install:all

# Create backend .env
if [ ! -f apps/backend/.env ]; then
    echo "📝 Creating backend .env file..."
    cp apps/backend/.env.example apps/backend/.env
    echo "✅ Created apps/backend/.env"
else
    echo "⚠️  apps/backend/.env already exists"
fi

# Create uploads directory
if [ ! -d apps/backend/uploads ]; then
    echo "📁 Creating uploads directory..."
    mkdir -p apps/backend/uploads
    echo "✅ Created apps/backend/uploads"
fi

echo ""
echo "✨ Setup complete!"
echo ""
echo "To start the application:"
echo "  npm run dev"
echo ""
echo "Frontend: http://localhost:5173"
echo "Backend:  http://localhost:3000"
