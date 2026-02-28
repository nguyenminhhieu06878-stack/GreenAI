#!/bin/bash

echo "🏥 GreenEnergy AI Health Check"
echo "================================"
echo ""

# Check Node.js
echo "📦 Checking Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo "✅ Node.js: $NODE_VERSION"
else
    echo "❌ Node.js not found"
    exit 1
fi

# Check npm
echo "📦 Checking npm..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    echo "✅ npm: $NPM_VERSION"
else
    echo "❌ npm not found"
    exit 1
fi

# Check if node_modules exists
echo ""
echo "📁 Checking dependencies..."
if [ -d "node_modules" ]; then
    echo "✅ Root dependencies installed"
else
    echo "⚠️  Root dependencies not installed"
    echo "   Run: npm install"
fi

if [ -d "apps/frontend/node_modules" ]; then
    echo "✅ Frontend dependencies installed"
else
    echo "⚠️  Frontend dependencies not installed"
fi

if [ -d "apps/backend/node_modules" ]; then
    echo "✅ Backend dependencies installed"
else
    echo "⚠️  Backend dependencies not installed"
fi

# Check .env files
echo ""
echo "🔐 Checking environment files..."
if [ -f "apps/backend/.env" ]; then
    echo "✅ Backend .env exists"
else
    echo "⚠️  Backend .env not found"
    echo "   Run: cp apps/backend/.env.example apps/backend/.env"
fi

# Check uploads directory
echo ""
echo "📁 Checking directories..."
if [ -d "apps/backend/uploads" ]; then
    echo "✅ Uploads directory exists"
else
    echo "⚠️  Uploads directory not found"
    echo "   Run: mkdir -p apps/backend/uploads"
fi

# Check if services are running
echo ""
echo "🚀 Checking services..."

# Check frontend
if curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo "✅ Frontend is running (http://localhost:5173)"
else
    echo "⚠️  Frontend is not running"
fi

# Check backend
if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "✅ Backend is running (http://localhost:3000)"
else
    echo "⚠️  Backend is not running"
fi

echo ""
echo "================================"
echo "Health check complete!"
