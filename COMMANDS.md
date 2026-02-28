# ⚡ Quick Commands Reference

## 🚀 Setup & Installation

```bash
# Setup toàn bộ project (recommended)
npm run setup

# Hoặc thủ công
npm run install:all
cd apps/backend && cp .env.example .env && cd ../..
mkdir -p apps/backend/uploads
```

## 🏃 Development

```bash
# Chạy cả Frontend + Backend
npm run dev

# Chạy riêng Frontend (port 5173)
npm run dev:frontend

# Chạy riêng Backend (port 3000)
npm run dev:backend

# Chạy với auto-setup
npm run start:dev
```

## 🏗️ Build

```bash
# Build tất cả
npm run build

# Build riêng Frontend
npm run build --workspace=apps/frontend

# Build riêng Backend
npm run build --workspace=apps/backend
```

## 🧹 Maintenance

```bash
# Health check
npm run health

# Clean project
npm run clean

# Reinstall dependencies
npm run install:all
```

## 🐳 Docker

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild and restart
docker-compose up -d --build
```

## 🧪 Testing (when available)

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

## 📦 Package Management

```bash
# Add dependency to frontend
npm install <package> --workspace=apps/frontend

# Add dependency to backend
npm install <package> --workspace=apps/backend

# Add dev dependency
npm install -D <package> --workspace=apps/frontend

# Update dependencies
npm update --workspaces
```

## 🔍 Debugging

```bash
# Check Node version
node -v

# Check npm version
npm -v

# List installed packages
npm list --workspace=apps/frontend

# Check for outdated packages
npm outdated --workspaces

# Find process using port
lsof -i :3000
lsof -i :5173

# Kill process
kill -9 <PID>
```

## 📝 Git Workflow

```bash
# Create new branch
git checkout -b feature/your-feature

# Stage changes
git add .

# Commit with conventional commits
git commit -m "feat: add new feature"
git commit -m "fix: fix bug"
git commit -m "docs: update documentation"

# Push to remote
git push origin feature/your-feature

# Pull latest changes
git pull origin main

# Merge main into your branch
git merge main
```

## 🔧 Useful Scripts

```bash
# Frontend specific
cd apps/frontend
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint

# Backend specific
cd apps/backend
npm run dev          # Start dev server with tsx watch
npm run build        # Compile TypeScript
npm start            # Run compiled code
```

## 🌐 URLs

```bash
# Development
Frontend:     http://localhost:5173
Backend:      http://localhost:3000
Health Check: http://localhost:3000/api/health

# API Endpoints
Login:        POST http://localhost:3000/api/auth/login
Register:     POST http://localhost:3000/api/auth/register
Dashboard:    GET  http://localhost:3000/api/analytics/dashboard
```

## 📊 Monitoring

```bash
# View backend logs
cd apps/backend
npm run dev  # Logs will appear in terminal

# View frontend logs
cd apps/frontend
npm run dev  # Logs will appear in terminal

# Docker logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

## 🔐 Environment Variables

```bash
# Backend (.env)
PORT=3000
NODE_ENV=development
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# Frontend (vite)
VITE_API_URL=http://localhost:3000/api
```

## 🆘 Troubleshooting

```bash
# Clear node_modules and reinstall
rm -rf node_modules apps/*/node_modules
npm run install:all

# Clear build artifacts
rm -rf apps/frontend/dist apps/backend/dist

# Reset git changes
git reset --hard HEAD
git clean -fd

# Check for port conflicts
lsof -i :3000
lsof -i :5173
```

## 📚 Documentation

```bash
# View documentation
cat README.md
cat QUICKSTART.md
cat API.md
cat FEATURES.md

# Open in browser (macOS)
open README.md

# Open in browser (Linux)
xdg-open README.md
```

---

**Tip**: Bookmark this file for quick reference! 📌
