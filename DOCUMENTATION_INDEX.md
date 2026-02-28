# 📚 Documentation Index - GreenEnergy AI

Chào mừng đến với tài liệu GreenEnergy AI! Dưới đây là danh sách đầy đủ các tài liệu có sẵn.

## 🚀 Getting Started

| Document | Description | For |
|----------|-------------|-----|
| [README.md](./README.md) | Tổng quan dự án, giới thiệu chung | Everyone |
| [QUICKSTART.md](./QUICKSTART.md) | Hướng dẫn chạy nhanh trong 3 bước | Beginners |
| [GETTING_STARTED.md](./GETTING_STARTED.md) | Hướng dẫn chi tiết cho người mới | Beginners |
| [COMMANDS.md](./COMMANDS.md) | Tham chiếu nhanh các lệnh | Developers |

## 🛠️ Development

| Document | Description | For |
|----------|-------------|-----|
| [SETUP.md](./SETUP.md) | Hướng dẫn cài đặt chi tiết | Developers |
| [API.md](./API.md) | API documentation đầy đủ | Developers |
| [FEATURES.md](./FEATURES.md) | Danh sách tính năng và roadmap | Everyone |
| [TODO.md](./TODO.md) | Danh sách công việc cần làm | Contributors |
| [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) | Tóm tắt toàn bộ dự án | Everyone |

## 🤝 Contributing

| Document | Description | For |
|----------|-------------|-----|
| [CONTRIBUTING.md](./CONTRIBUTING.md) | Hướng dẫn đóng góp code | Contributors |
| [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) | Quy tắc ứng xử cộng đồng | Everyone |
| [.github/pull_request_template.md](./.github/pull_request_template.md) | Template cho Pull Request | Contributors |
| [.github/ISSUE_TEMPLATE/](./.github/ISSUE_TEMPLATE/) | Templates cho Issues | Everyone |

## 🚀 Deployment

| Document | Description | For |
|----------|-------------|-----|
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Hướng dẫn deploy production | DevOps |
| [docker-compose.yml](./docker-compose.yml) | Docker configuration | DevOps |
| [Dockerfile.frontend](./Dockerfile.frontend) | Frontend Docker image | DevOps |
| [Dockerfile.backend](./Dockerfile.backend) | Backend Docker image | DevOps |

## 🔒 Security & Legal

| Document | Description | For |
|----------|-------------|-----|
| [SECURITY.md](./SECURITY.md) | Security policy và reporting | Everyone |
| [LICENSE](./LICENSE) | MIT License | Everyone |

## 📝 Project Management

| Document | Description | For |
|----------|-------------|-----|
| [CHANGELOG.md](./CHANGELOG.md) | Lịch sử thay đổi phiên bản | Everyone |
| [TODO.md](./TODO.md) | Danh sách công việc | Team |

## 🔧 Configuration Files

| File | Description |
|------|-------------|
| [package.json](./package.json) | Root package configuration |
| [apps/frontend/package.json](./apps/frontend/package.json) | Frontend dependencies |
| [apps/backend/package.json](./apps/backend/package.json) | Backend dependencies |
| [.prettierrc](./.prettierrc) | Code formatting rules |
| [.editorconfig](./.editorconfig) | Editor configuration |
| [.vscode/settings.json](./.vscode/settings.json) | VS Code settings |

## 🛠️ Scripts

| Script | Location | Description |
|--------|----------|-------------|
| [setup.sh](./scripts/setup.sh) | scripts/ | Setup project |
| [dev.sh](./scripts/dev.sh) | scripts/ | Start development |
| [clean.sh](./scripts/clean.sh) | scripts/ | Clean project |
| [health-check.sh](./scripts/health-check.sh) | scripts/ | Health check |

## 📊 Architecture

```
Frontend (React 19)
    ↓ HTTP/REST
Backend (Express)
    ↓ (Future)
Database (PostgreSQL)
```

## 🎯 Quick Links by Role

### 👨‍💻 Developer mới
1. [GETTING_STARTED.md](./GETTING_STARTED.md)
2. [QUICKSTART.md](./QUICKSTART.md)
3. [COMMANDS.md](./COMMANDS.md)
4. [API.md](./API.md)

### 🚀 Contributor
1. [CONTRIBUTING.md](./CONTRIBUTING.md)
2. [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md)
3. [TODO.md](./TODO.md)
4. [FEATURES.md](./FEATURES.md)

### 🏗️ DevOps Engineer
1. [DEPLOYMENT.md](./DEPLOYMENT.md)
2. [docker-compose.yml](./docker-compose.yml)
3. [SECURITY.md](./SECURITY.md)

### 📊 Project Manager
1. [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)
2. [FEATURES.md](./FEATURES.md)
3. [TODO.md](./TODO.md)
4. [CHANGELOG.md](./CHANGELOG.md)

## 🔍 Search Tips

```bash
# Tìm trong tất cả documentation
grep -r "keyword" *.md

# Tìm trong code
grep -r "keyword" apps/

# Tìm file
find . -name "*.md"
```

## 📞 Need Help?

- 📖 Đọc documentation phù hợp với vai trò của bạn
- 🐛 [Report bugs](https://github.com/your-repo/issues/new?template=bug_report.md)
- 💡 [Request features](https://github.com/your-repo/issues/new?template=feature_request.md)
- 💬 Join our community discussions

---

**Last Updated**: 2024-01-01  
**Documentation Version**: 1.0.0
