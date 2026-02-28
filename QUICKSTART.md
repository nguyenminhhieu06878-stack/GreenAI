# 🚀 Quick Start - GreenEnergy AI

## Chạy nhanh trong 3 bước

### Bước 1: Cài đặt dependencies
```bash
npm run install:all
```

### Bước 2: Tạo file .env cho backend
```bash
cd apps/backend
cp .env.example .env
cd ../..
```

### Bước 3: Chạy ứng dụng
```bash
npm run dev
```

Xong! Truy cập:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000

## 🎯 Tài khoản demo

Đăng ký tài khoản mới hoặc sử dụng mock login với bất kỳ email/password nào.

## 📱 Các trang chính

- `/` - Dashboard
- `/bieu-do-tieu-thu` - Biểu đồ tiêu thụ điện
- `/nhap-chi-so` - Nhập chỉ số điện
- `/meo-tiet-kiem` - Mẹo tiết kiệm điện
- `/bang-gia` - Bảng giá dịch vụ

## 🛠️ Tech Stack

**Frontend**: React 19, TypeScript, Vite, TailwindCSS, Recharts
**Backend**: Node.js, Express, TypeScript, JWT

## 📚 Tài liệu

- [README.md](./README.md) - Tổng quan dự án
- [SETUP.md](./SETUP.md) - Hướng dẫn chi tiết
- [API.md](./API.md) - API documentation
- [FEATURES.md](./FEATURES.md) - Danh sách tính năng

## ❓ Gặp vấn đề?

1. Xóa `node_modules` và cài lại:
```bash
rm -rf node_modules apps/*/node_modules
npm run install:all
```

2. Kiểm tra port 3000 và 5173 có bị chiếm không
3. Đảm bảo Node.js version >= 18
