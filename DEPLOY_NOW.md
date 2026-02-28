# Deploy Ngay Lập Tức

## ⚠️ Lưu Ý: Code có lỗi TypeScript

Backend hiện có một số lỗi TypeScript cần fix trước khi deploy. Có 2 lựa chọn:

### Lựa chọn 1: Deploy Frontend trước (Khuyến khích)

Frontend không có lỗi, có thể deploy ngay:

```bash
cd apps/frontend
vercel --prod
```

### Lựa chọn 2: Fix lỗi Backend rồi deploy

Cần fix 6 lỗi TypeScript trong backend trước:

1. **auth.controller.ts** - JWT expiresIn type error (3 lỗi)
2. **payment.controller.ts** - req.user.id không tồn tại (2 lỗi)
3. **subscription.controller.ts** - planLimits.planName không tồn tại (1 lỗi)

---

## Hướng Dẫn Deploy Frontend (Không có lỗi)

### Bước 1: Deploy Frontend
```bash
cd apps/frontend
vercel login
vercel --prod
```

### Bước 2: Trả lời câu hỏi Vercel
- **Set up and deploy?** → `Y`
- **Which scope?** → Chọn account của bạn
- **Link to existing project?** → `N`
- **What's your project's name?** → `greenenergy`
- **In which directory is your code located?** → `./`
- **Want to override settings?** → `Y`
  - **Build Command**: `npm run build`
  - **Output Directory**: `dist`
  - **Development Command**: `npm run dev`

### Bước 3: Lấy URL
Sau khi deploy xong, copy URL (ví dụ: `https://greenenergy.vercel.app`)

### Bước 4: Cấu hình Environment Variables
```bash
vercel env add VITE_API_URL
# Nhập: http://localhost:3000 (tạm thời dùng local backend)
```

Hoặc vào Dashboard:
1. https://vercel.com/dashboard
2. Chọn project `greenenergy`
3. Settings → Environment Variables
4. Thêm: `VITE_API_URL` = `http://localhost:3000`

### Bước 5: Redeploy
```bash
vercel --prod
```

---

## Fix Lỗi Backend (Nếu muốn deploy backend)

### Lỗi 1: JWT expiresIn type error

File: `apps/backend/src/controllers/auth.controller.ts`

Tìm dòng:
```typescript
const token = jwt.sign(
  { id: user._id, email: user.email, role: user.role },
  config.jwt.secret,
  { expiresIn: config.jwt.expiresIn }
)
```

Sửa thành:
```typescript
const token = jwt.sign(
  { id: user._id.toString(), email: user.email, role: user.role },
  config.jwt.secret,
  { expiresIn: '7d' }
)
```

Làm tương tự cho 3 chỗ trong file này.

### Lỗi 2: req.user.id không tồn tại

File: `apps/backend/src/controllers/payment.controller.ts`

Tìm:
```typescript
const userId = req.user?.id;
```

Sửa thành:
```typescript
const userId = req.user?._id || req.user?.id;
```

### Lỗi 3: planLimits.planName không tồn tại

File: `apps/backend/src/controllers/subscription.controller.ts`

Tìm dòng 285:
```typescript
planName: planLimits.planName
```

Sửa thành:
```typescript
planName: planName
```

---

## Sau khi fix xong, deploy Backend

```bash
cd apps/backend
npm run build
vercel --prod
```

---

## Hoặc Deploy Không Cần Build (Nhanh hơn)

Vercel có thể chạy TypeScript trực tiếp:

```bash
cd apps/backend
vercel --prod
```

Vercel sẽ tự động build khi deploy.

---

## Tóm Tắt

1. ✅ **Frontend**: Deploy ngay được, không có lỗi
2. ⚠️ **Backend**: Cần fix 6 lỗi TypeScript trước

**Khuyến nghị**: Deploy frontend trước, dùng local backend để test. Sau đó fix lỗi backend rồi deploy.

---

## Câu Lệnh Nhanh

```bash
# Deploy frontend
cd apps/frontend && vercel --prod

# Deploy backend (sau khi fix lỗi)
cd apps/backend && vercel --prod
```

---

**Bạn muốn tôi fix các lỗi TypeScript giúp bạn không?**
