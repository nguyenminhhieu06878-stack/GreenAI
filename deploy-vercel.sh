#!/bin/bash

# Script deploy lên Vercel bằng CLI
# Chạy: bash deploy-vercel.sh

set -e

echo "🚀 GreenEnergy AI - Vercel Deployment Script"
echo "=============================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}❌ Vercel CLI chưa được cài đặt${NC}"
    echo "Cài đặt bằng: npm install -g vercel"
    exit 1
fi

echo -e "${GREEN}✅ Vercel CLI đã được cài đặt${NC}"
echo ""

# Login to Vercel
echo -e "${BLUE}📝 Đăng nhập Vercel...${NC}"
vercel login

echo ""
echo -e "${YELLOW}Chọn project để deploy:${NC}"
echo "1. Backend (API)"
echo "2. Frontend"
echo "3. Cả hai (Backend trước, Frontend sau)"
read -p "Nhập lựa chọn (1/2/3): " choice

case $choice in
    1)
        echo ""
        echo -e "${BLUE}🔧 Deploying Backend...${NC}"
        cd apps/backend
        
        # Build backend
        echo "Building backend..."
        npm install
        npm run build
        
        # Deploy to Vercel
        echo ""
        echo -e "${YELLOW}Deploying to Vercel...${NC}"
        vercel --prod
        
        echo ""
        echo -e "${GREEN}✅ Backend deployed!${NC}"
        echo -e "${YELLOW}📝 Nhớ cấu hình Environment Variables trong Vercel Dashboard:${NC}"
        echo "   - NODE_ENV=production"
        echo "   - MONGODB_URI=..."
        echo "   - JWT_SECRET=..."
        echo "   - GROQ_API_KEY=..."
        echo "   - PAYOS_CLIENT_ID=..."
        echo "   - PAYOS_API_KEY=..."
        echo "   - PAYOS_CHECKSUM_KEY=..."
        echo "   - GOOGLE_CLIENT_ID=..."
        echo "   - GOOGLE_CLIENT_SECRET=..."
        echo "   - CORS_ORIGIN=https://your-frontend-url.vercel.app"
        echo "   - FRONTEND_URL=https://your-frontend-url.vercel.app"
        ;;
    2)
        echo ""
        echo -e "${BLUE}🎨 Deploying Frontend...${NC}"
        cd apps/frontend
        
        # Build frontend
        echo "Building frontend..."
        npm install
        
        # Deploy to Vercel
        echo ""
        echo -e "${YELLOW}Deploying to Vercel...${NC}"
        vercel --prod
        
        echo ""
        echo -e "${GREEN}✅ Frontend deployed!${NC}"
        echo -e "${YELLOW}📝 Nhớ cấu hình Environment Variables trong Vercel Dashboard:${NC}"
        echo "   - VITE_API_URL=https://your-backend-url.vercel.app"
        ;;
    3)
        echo ""
        echo -e "${BLUE}🔧 Step 1: Deploying Backend...${NC}"
        cd apps/backend
        
        echo "Building backend..."
        npm install
        npm run build
        
        echo ""
        echo -e "${YELLOW}Deploying backend to Vercel...${NC}"
        vercel --prod
        
        BACKEND_URL=$(vercel ls --prod | grep backend | awk '{print $2}' | head -1)
        
        echo ""
        echo -e "${GREEN}✅ Backend deployed!${NC}"
        echo -e "${BLUE}Backend URL: ${BACKEND_URL}${NC}"
        
        echo ""
        echo -e "${BLUE}🎨 Step 2: Deploying Frontend...${NC}"
        cd ../frontend
        
        echo "Building frontend..."
        npm install
        
        echo ""
        echo -e "${YELLOW}Deploying frontend to Vercel...${NC}"
        vercel --prod
        
        echo ""
        echo -e "${GREEN}✅ Cả hai đã được deploy!${NC}"
        echo ""
        echo -e "${YELLOW}📝 Cấu hình Environment Variables:${NC}"
        echo ""
        echo -e "${BLUE}Backend:${NC}"
        echo "   - CORS_ORIGIN=https://your-frontend-url.vercel.app"
        echo "   - FRONTEND_URL=https://your-frontend-url.vercel.app"
        echo "   + Các biến khác (xem file .env)"
        echo ""
        echo -e "${BLUE}Frontend:${NC}"
        echo "   - VITE_API_URL=${BACKEND_URL}"
        ;;
    *)
        echo -e "${RED}❌ Lựa chọn không hợp lệ${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}🎉 Deployment hoàn tất!${NC}"
echo ""
echo -e "${YELLOW}📋 Các bước tiếp theo:${NC}"
echo "1. Vào Vercel Dashboard để cấu hình Environment Variables"
echo "2. Cập nhật Google OAuth callback URLs"
echo "3. Cập nhật PayOS webhook URL"
echo "4. Cấu hình custom domain (nếu có)"
echo ""
echo -e "${BLUE}Vercel Dashboard: https://vercel.com/dashboard${NC}"
