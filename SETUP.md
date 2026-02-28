# Hướng Dẫn Cài Đặt GreenEnergy AI

## Yêu cầu hệ thống
- Node.js 18+ 
- npm hoặc yarn

## Cài đặt

### 1. Cài đặt dependencies

```bash
# Cài đặt tất cả dependencies cho cả frontend và backend
npm run install:all
```

### 2. Cấu hình Backend

```bash
# Copy file .env.example
cd apps/backend
cp .env.example .env

# Chỉnh sửa file .env với thông tin của bạn
```

### 3. Chạy ứng dụng

#### Chạy cả Frontend và Backend cùng lúc:
```bash
npm run dev
```

#### Hoặc chạy riêng lẻ:

**Frontend** (http://localhost:5173):
```bash
npm run dev:frontend
```

**Backend** (http://localhost:3000):
```bash
npm run dev:backend
```

## Cấu trúc dự án

```
greenenergy-ai/
├── apps/
│   ├── frontend/          # React 19 + TypeScript + Vite
│   │   ├── src/
│   │   │   ├── components/    # Components tái sử dụng
│   │   │   ├── pages/         # Các trang chính
│   │   │   ├── stores/        # Zustand stores
│   │   │   ├── lib/           # Utilities, API client
│   │   │   ├── App.tsx
│   │   │   └── main.tsx
│   │   ├── public/
│   │   └── package.json
│   │
│   └── backend/           # Express + TypeScript
│       ├── src/
│       │   ├── controllers/   # Business logic
│       │   ├── routes/        # API routes
│       │   ├── middleware/    # Auth, error handling
│       │   └── index.ts
│       └── package.json
│
├── package.json           # Root package.json
└── README.md
```

## Tính năng đã triển khai

### Frontend
- ✅ Dashboard với biểu đồ tiêu thụ điện
- ✅ Đăng nhập / Đăng ký
- ✅ Nhập chỉ số điện (chụp ảnh + thủ công)
- ✅ Biểu đồ phân tích tiêu thụ
- ✅ Mẹo tiết kiệm điện
- ✅ Bảng giá dịch vụ
- ✅ Responsive design với TailwindCSS
- ✅ State management với Zustand
- ✅ Charts với Recharts

### Backend
- ✅ Authentication (JWT)
- ✅ API endpoints cho meter readings
- ✅ API analytics và dashboard
- ✅ Upload ảnh đồng hồ điện
- ✅ Error handling middleware

## Công nghệ sử dụng

### Frontend
- React 19
- TypeScript
- Vite
- TailwindCSS
- Recharts (biểu đồ)
- React Router v6
- Zustand (state management)
- React Query
- Axios
- Lucide React (icons)

### Backend
- Node.js
- Express
- TypeScript
- JWT (authentication)
- Bcrypt (password hashing)
- Multer (file upload)

## Các bước tiếp theo

1. **Tích hợp Database**: Thêm PostgreSQL với Prisma ORM
2. **AI/ML**: Tích hợp OCR để nhận diện đồng hồ điện
3. **Payment**: Tích hợp cổng thanh toán
4. **Notifications**: Thêm hệ thống thông báo
5. **Admin Panel**: Xây dựng trang quản trị
6. **Testing**: Thêm unit tests và e2e tests
