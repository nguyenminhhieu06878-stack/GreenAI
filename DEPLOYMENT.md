# 🚀 Deployment Guide - GreenEnergy AI

## 📋 Prerequisites

- Node.js 18+
- Docker & Docker Compose (optional)
- PostgreSQL (for production)

## 🐳 Docker Deployment (Recommended)

### 1. Build và chạy với Docker Compose

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

**Access:**
- Frontend: http://localhost:5173
- Backend: http://localhost:3000

### 2. Environment Variables

Tạo file `.env` trong root directory:

```env
JWT_SECRET=your-super-secret-key-change-this
DATABASE_URL=postgresql://user:password@db:5432/greenenergy
```

## 🖥️ Manual Deployment

### Frontend (Vercel/Netlify)

#### Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd apps/frontend
vercel --prod
```

#### Netlify

```bash
# Build
cd apps/frontend
npm run build

# Deploy dist folder to Netlify
```

**Environment Variables:**
```
VITE_API_URL=https://your-backend-api.com/api
```

### Backend (Railway/Render/Heroku)

#### Railway

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Deploy
cd apps/backend
railway up
```

#### Render

1. Connect GitHub repository
2. Select `apps/backend` as root directory
3. Build command: `npm install && npm run build`
4. Start command: `node dist/index.js`

**Environment Variables:**
```
PORT=3000
NODE_ENV=production
JWT_SECRET=your-secret-key
DATABASE_URL=postgresql://...
```

## 🗄️ Database Setup

### PostgreSQL

```bash
# Create database
createdb greenenergy

# Run migrations (when Prisma is set up)
npx prisma migrate deploy
```

### Environment Variable

```env
DATABASE_URL=postgresql://user:password@localhost:5432/greenenergy
```

## 🔒 Security Checklist

- [ ] Change JWT_SECRET to strong random string
- [ ] Enable HTTPS
- [ ] Set up CORS properly
- [ ] Enable rate limiting
- [ ] Set up firewall rules
- [ ] Regular security updates
- [ ] Backup database regularly
- [ ] Monitor logs

## 📊 Monitoring

### Logs

```bash
# Docker logs
docker-compose logs -f backend
docker-compose logs -f frontend

# PM2 (if using)
pm2 logs
```

### Health Check

```bash
# Backend health
curl http://localhost:3000/api/health

# Response: {"status":"ok","message":"GreenEnergy AI API is running"}
```

## 🔄 CI/CD with GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm run build
      # Add deployment steps
```

## 🌐 Domain Setup

### Frontend (Vercel)

1. Add custom domain in Vercel dashboard
2. Update DNS records

### Backend (Railway)

1. Add custom domain in Railway dashboard
2. Update DNS records
3. Update CORS settings

## 📈 Performance Optimization

- Enable Gzip compression
- Use CDN for static assets
- Optimize images
- Enable caching
- Use connection pooling for database

## 🆘 Troubleshooting

### Port already in use

```bash
# Find process
lsof -i :3000

# Kill process
kill -9 <PID>
```

### Database connection failed

- Check DATABASE_URL
- Verify database is running
- Check firewall rules

### Build failed

```bash
# Clear cache
rm -rf node_modules
npm run install:all
npm run build
```

## 📞 Support

For deployment issues, open an issue on GitHub or contact the team.
