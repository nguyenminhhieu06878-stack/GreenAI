# 🌱 GreenEnergy AI - Hệ Thống Quản Lý Tiêu Thụ Điện Năng Thông Minh

<div align="center">
  <img src="./apps/frontend/public/logo.svg" alt="GreenEnergy AI Logo" width="120" />
  
  **Giúp sinh viên và người thuê trọ theo dõi, phân tích và quản lý mức tiêu thụ điện năng thông minh**
  
  [![React](https://img.shields.io/badge/React-19-blue)](https://react.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
  [![Node.js](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org/)
</div>

---

## 📖 Giới thiệu

GreenEnergy AI là nền tảng số giúp người dùng:
- 📸 Chụp và nhận diện tự động chỉ số đồng hồ điện
- 📊 Theo dõi tiêu thụ điện theo ngày/tháng với biểu đồ trực quan
- 💰 Ước tính chi phí điện năng chính xác
- 💡 Nhận gợi ý tiết kiệm điện thông minh
- ⚠️ Cảnh báo tiêu thụ bất thường
- 🏠 Quản lý nhiều phòng trọ (dành cho chủ trọ)

## ✨ Tính năng nổi bật

- ✅ **Dashboard trực quan** với biểu đồ Line, Bar, Pie charts
- ✅ **Nhập chỉ số điện** qua chụp ảnh hoặc thủ công
- ✅ **Phân tích tiêu thụ** theo ngày, tháng, khung giờ
- ✅ **Mẹo tiết kiệm điện** được cá nhân hóa
- ✅ **3 gói dịch vụ** linh hoạt (Miễn phí, Cá nhân, Chủ trọ)
- ✅ **Responsive design** hoạt động mượt mà trên mọi thiết bị

## 🚀 Quick Start

```bash
# 1. Cài đặt dependencies
npm run install:all

# 2. Tạo file .env cho backend
cd apps/backend && cp .env.example .env && cd ../..

# 3. Chạy ứng dụng
npm run dev
```

**Truy cập:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

👉 Xem [QUICKSTART.md](./QUICKSTART.md) để biết thêm chi tiết

## 🛠️ Công nghệ

### Frontend
- **React 19** - UI framework mới nhất
- **TypeScript** - Type safety
- **Vite** - Build tool siêu nhanh
- **TailwindCSS** - Utility-first CSS
- **Recharts** - Biểu đồ tương tác
- **React Router v6** - Routing
- **Zustand** - State management
- **React Query** - Data fetching
- **Axios** - HTTP client
- **Lucide React** - Icons

### Backend
- **Node.js + Express** - REST API
- **TypeScript** - Type safety
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Multer** - File upload

## 📁 Cấu trúc dự án

```
greenenergy-ai/
├── apps/
│   ├── frontend/              # React 19 App
│   │   ├── src/
│   │   │   ├── components/    # Reusable components
│   │   │   ├── pages/         # Page components
│   │   │   ├── stores/        # Zustand stores
│   │   │   ├── hooks/         # Custom hooks
│   │   │   ├── lib/           # API client, utilities
│   │   │   ├── types/         # TypeScript types
│   │   │   └── utils/         # Helper functions
│   │   └── public/            # Static assets
│   │
│   └── backend/               # Express API
│       ├── src/
│       │   ├── controllers/   # Request handlers
│       │   ├── routes/        # API routes
│       │   ├── middleware/    # Auth, error handling
│       │   └── types/         # TypeScript types
│       └── uploads/           # Uploaded images
│
├── API.md                     # API documentation
├── FEATURES.md                # Feature list
├── SETUP.md                   # Detailed setup guide
└── QUICKSTART.md              # Quick start guide
```

## 📚 Tài liệu

- [QUICKSTART.md](./QUICKSTART.md) - Hướng dẫn chạy nhanh
- [SETUP.md](./SETUP.md) - Hướng dẫn cài đặt chi tiết
- [API.md](./API.md) - API documentation
- [FEATURES.md](./FEATURES.md) - Danh sách tính năng đầy đủ

## 🎯 Roadmap

### ✅ Phase 1 - MVP (Hoàn thành)
- Authentication & Authorization
- Dashboard với biểu đồ
- Nhập chỉ số điện
- Mẹo tiết kiệm điện
- Bảng giá dịch vụ

### 🚧 Phase 2 - Core Features (Đang phát triển)
- [ ] Tích hợp OCR thực tế
- [ ] Database PostgreSQL + Prisma
- [ ] Tính toán theo chu kỳ thanh toán
- [ ] Cảnh báo tiêu thụ bất thường
- [ ] AI recommendations

### 📅 Phase 3 - Advanced Features
- [ ] Quản lý nhiều phòng (Chủ trọ)
- [ ] Thanh toán online
- [ ] Push notifications
- [ ] Export PDF reports
- [ ] Admin dashboard

## 🤝 Đóng góp

Mọi đóng góp đều được chào đón! Vui lòng:
1. Fork repository
2. Tạo branch mới (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Mở Pull Request

## 📄 License

Dự án này được phát triển cho mục đích học tập và nghiên cứu.

## 👥 Team

Phát triển bởi nhóm GreenEnergy AI

---

<div align="center">
  Made with ❤️ and ⚡ by GreenEnergy AI Team
</div>
