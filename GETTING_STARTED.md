# 🚀 Getting Started with GreenEnergy AI

Chào mừng bạn đến với GreenEnergy AI! Hướng dẫn này sẽ giúp bạn bắt đầu với dự án.

## 📋 Yêu cầu

Trước khi bắt đầu, hãy đảm bảo bạn đã cài đặt:

- **Node.js** 18 hoặc cao hơn ([Download](https://nodejs.org/))
- **npm** (đi kèm với Node.js)
- **Git** ([Download](https://git-scm.com/))
- **Code Editor** (khuyến nghị: VS Code)

## 🎯 Bước 1: Clone Repository

```bash
git clone https://github.com/your-username/greenenergy-ai.git
cd greenenergy-ai
```

## 📦 Bước 2: Cài đặt Dependencies

```bash
npm run setup
```

Hoặc thủ công:

```bash
# Cài đặt dependencies
npm run install:all

# Tạo file .env
cd apps/backend
cp .env.example .env
cd ../..

# Tạo thư mục uploads
mkdir -p apps/backend/uploads
```

## 🔧 Bước 3: Cấu hình

### Backend (.env)

Mở file `apps/backend/.env` và cập nhật:

```env
PORT=3000
NODE_ENV=development
JWT_SECRET=your-super-secret-key-here
JWT_EXPIRES_IN=7d
```

**Lưu ý**: Thay đổi `JWT_SECRET` thành một chuỗi ngẫu nhiên mạnh!

## 🚀 Bước 4: Chạy ứng dụng

```bash
npm run dev
```

Hoặc chạy riêng lẻ:

```bash
# Terminal 1 - Frontend
npm run dev:frontend

# Terminal 2 - Backend
npm run dev:backend
```

## 🌐 Bước 5: Truy cập ứng dụng

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **Health Check**: http://localhost:3000/api/health

## 🎨 Bước 6: Khám phá giao diện

### Đăng ký tài khoản

1. Truy cập http://localhost:5173
2. Click "Đăng ký ngay"
3. Điền thông tin:
   - Họ và tên
   - Email
   - Mật khẩu
   - Vai trò (Người thuê trọ / Chủ trọ)
4. Click "Đăng ký"

### Đăng nhập

1. Nhập email và mật khẩu
2. Click "Đăng nhập"
3. Bạn sẽ được chuyển đến Dashboard

### Khám phá các trang

- **Dashboard** (`/`) - Tổng quan tiêu thụ điện
- **Biểu đồ tiêu thụ** (`/bieu-do-tieu-thu`) - Phân tích chi tiết
- **Nhập chỉ số** (`/nhap-chi-so`) - Chụp/nhập chỉ số điện
- **Mẹo tiết kiệm** (`/meo-tiet-kiem`) - Tips tiết kiệm điện
- **Bảng giá** (`/bang-gia`) - Các gói dịch vụ

## 🛠️ Bước 7: Phát triển

### Cấu trúc code

```
apps/frontend/src/
├── components/     # UI components
├── pages/          # Page components
├── stores/         # State management
├── hooks/          # Custom hooks
├── lib/            # API client
└── utils/          # Helpers

apps/backend/src/
├── controllers/    # Business logic
├── routes/         # API routes
├── middleware/     # Middleware
└── config/         # Configuration
```

### Thêm component mới

```tsx
// apps/frontend/src/components/MyComponent.tsx
export default function MyComponent() {
  return <div>Hello World</div>
}
```

### Thêm API endpoint mới

```typescript
// apps/backend/src/routes/myroute.routes.ts
import { Router } from 'express'
import { authenticate } from '../middleware/auth'

const router = Router()

router.get('/', authenticate, (req, res) => {
  res.json({ message: 'Hello API' })
})

export default router
```

## 🧪 Bước 8: Testing

```bash
# Chạy health check
npm run health

# Kiểm tra linter (khi có)
npm run lint --workspace=apps/frontend
```

## 📚 Bước 9: Đọc thêm

- [API Documentation](./API.md) - Chi tiết API endpoints
- [Features](./FEATURES.md) - Danh sách tính năng
- [Contributing](./CONTRIBUTING.md) - Hướng dẫn đóng góp

## ❓ Gặp vấn đề?

### Port đã được sử dụng

```bash
# Tìm process đang dùng port
lsof -i :3000  # hoặc :5173

# Kill process
kill -9 <PID>
```

### Dependencies lỗi

```bash
# Xóa và cài lại
npm run clean
npm run setup
```

### Backend không kết nối

1. Kiểm tra file `.env` đã tồn tại
2. Kiểm tra port 3000 có bị chiếm không
3. Xem logs trong terminal

## 🎓 Học thêm

### React 19
- [React Docs](https://react.dev/)
- [React 19 Features](https://react.dev/blog/2024/04/25/react-19)

### TypeScript
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### TailwindCSS
- [Tailwind Docs](https://tailwindcss.com/docs)

### Express
- [Express Guide](https://expressjs.com/en/guide/routing.html)

## 🎉 Chúc mừng!

Bạn đã sẵn sàng phát triển với GreenEnergy AI! 🚀

Nếu có câu hỏi, hãy mở [GitHub Issue](https://github.com/your-username/greenenergy-ai/issues).

---

**Happy Coding!** 💚⚡
