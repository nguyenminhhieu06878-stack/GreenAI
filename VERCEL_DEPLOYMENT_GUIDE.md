# Hướng Dẫn Deploy 100% Lên Vercel

## Tổng Quan

Deploy toàn bộ ứng dụng (Frontend + Backend) lên Vercel với HTTP Polling thay vì Socket.io.

**Lưu ý**: Chat support sẽ có delay 3-5 giây (không real-time) do dùng HTTP polling.

---

## Bước 1: Chuẩn Bị Code

### 1.1. Đã chuyển đổi Socket.io sang HTTP Polling ✅
- Backend: Thêm endpoints `/api/support/messages/new` và `/api/support/admin/chats/:userId/new`
- Frontend: Dùng `setInterval` để poll tin nhắn mới mỗi 3 giây
- Xóa dependencies: `socket.io` và `socket.io-client`

### 1.2. Cài đặt lại dependencies
```bash
# Backend
cd apps/backend
npm install

# Frontend
cd apps/frontend
npm install
```

---

## Bước 2: Deploy Backend lên Vercel

### 2.1. Tạo file cấu hình Vercel cho Backend

File `apps/backend/vercel.json` đã được tạo:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/index.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/index.ts"
    }
  ]
}
```

### 2.2. Deploy Backend
1. Truy cập [Vercel.com](https://vercel.com)
2. Click "Add New" → "Project"
3. Import repository
4. Cấu hình:
   - **Project Name**: `greenenergy-backend`
   - **Framework Preset**: Other
   - **Root Directory**: `apps/backend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 2.3. Cấu hình Environment Variables cho Backend
Vào "Settings" → "Environment Variables":

```env
NODE_ENV=production
PORT=3000

# JWT
JWT_SECRET=your-production-secret-key-change-this
JWT_EXPIRES_IN=7d

# MongoDB Atlas
MONGODB_URI=mongodb+srv://quocbao:Hieunguyen1002@cluster0.segxwna.mongodb.net/greenenergy?retryWrites=true&w=majority&appName=Cluster0

# Upload
UPLOAD_DIR=/tmp/uploads
MAX_FILE_SIZE=5242880

# AI - Groq API
GROQ_API_KEY=your-groq-api-key-here

# PayOS
PAYOS_CLIENT_ID=c6b38db6-d4b5-47d7-8dd7-9d295ece27a3
PAYOS_API_KEY=8909c3a3-d25a-4eb8-8a09-64426e4616be
PAYOS_CHECKSUM_KEY=3bb07e9c6e00c4699b49b5f28ec2d095783286360de53a0442a187f820bbd16f

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# URLs - SẼ CẬP NHẬT SAU
CORS_ORIGIN=https://greenenergy.vn
FRONTEND_URL=https://greenenergy.vn
GOOGLE_CALLBACK_URL=https://api-greenenergy.vercel.app/api/auth/google/callback
PAYOS_RETURN_URL=https://greenenergy.vn/thanh-toan/thanh-cong
PAYOS_CANCEL_URL=https://greenenergy.vn/thanh-toan/that-bai
```

**Lưu ý**: `UPLOAD_DIR=/tmp/uploads` vì Vercel serverless chỉ cho phép ghi vào `/tmp`

### 2.4. Lấy Backend URL
Sau khi deploy, Vercel tạo URL (ví dụ: `https://api-greenenergy.vercel.app`)

---

## Bước 3: Deploy Frontend lên Vercel

### 3.1. File cấu hình đã có
File `apps/frontend/vercel.json` đã được tạo với proxy rules.

### 3.2. Deploy Frontend
1. Click "Add New" → "Project" (hoặc dùng cùng project với monorepo)
2. Cấu hình:
   - **Project Name**: `greenenergy`
   - **Framework Preset**: Vite
   - **Root Directory**: `apps/frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 3.3. Cấu hình Environment Variables cho Frontend
```env
VITE_API_URL=https://api-greenenergy.vercel.app
```

### 3.4. Lấy Frontend URL
Sau khi deploy: `https://greenenergy.vercel.app`

---

## Bước 4: Cấu hình Custom Domain (Tenten.vn)

### 4.1. Mua tên miền tại Tenten.vn
- Mua 1 domain (ví dụ: `greenenergy.vn`)

### 4.2. Cấu hình Domain cho Frontend
1. Vào Vercel project frontend
2. "Settings" → "Domains"
3. Thêm: `greenenergy.vn` và `www.greenenergy.vn`
4. Vercel sẽ cho DNS records

**Tại Tenten.vn DNS:**
```
Type: A
Host: @
Value: 76.76.21.21
TTL: 3600

Type: CNAME
Host: www
Value: cname.vercel-dns.com
TTL: 3600
```

### 4.3. Cấu hình Subdomain cho Backend
1. Vào Vercel project backend
2. "Settings" → "Domains"
3. Thêm: `api.greenenergy.vn`
4. Vercel sẽ cho CNAME record

**Tại Tenten.vn DNS:**
```
Type: CNAME
Host: api
Value: cname.vercel-dns.com
TTL: 3600
```

---

## Bước 5: Cập Nhật Environment Variables

### 5.1. Cập nhật Backend Environment Variables
```env
CORS_ORIGIN=https://greenenergy.vn
FRONTEND_URL=https://greenenergy.vn
GOOGLE_CALLBACK_URL=https://api.greenenergy.vn/api/auth/google/callback
PAYOS_RETURN_URL=https://greenenergy.vn/thanh-toan/thanh-cong
PAYOS_CANCEL_URL=https://greenenergy.vn/thanh-toan/that-bai
```

### 5.2. Cập nhật Frontend Environment Variables
```env
VITE_API_URL=https://api.greenenergy.vn
```

### 5.3. Redeploy
Sau khi cập nhật env vars, click "Redeploy" ở cả 2 projects.

---

## Bước 6: Cập Nhật Google OAuth

1. Truy cập [Google Cloud Console](https://console.cloud.google.com)
2. "APIs & Services" → "Credentials"
3. Chọn OAuth 2.0 Client ID
4. Thêm vào "Authorized redirect URIs":
   ```
   https://api.greenenergy.vn/api/auth/google/callback
   ```
5. Thêm vào "Authorized JavaScript origins":
   ```
   https://greenenergy.vn
   https://api.greenenergy.vn
   ```

---

## Bước 7: Cập Nhật PayOS Webhook

1. Đăng nhập [PayOS Dashboard](https://my.payos.vn)
2. "Cài đặt" → "Webhook"
3. Cập nhật URL:
   ```
   https://api.greenenergy.vn/api/payment/webhook
   ```

---

## Bước 8: Kiểm Tra

### 8.1. Test Backend
```bash
curl https://api.greenenergy.vn/api/health
```

Kết quả:
```json
{
  "status": "ok",
  "message": "GreenEnergy AI API is running"
}
```

### 8.2. Test Frontend
- Truy cập: `https://greenenergy.vn`
- Kiểm tra:
  - ✅ Đăng ký/Đăng nhập
  - ✅ Google OAuth
  - ✅ Thanh toán PayOS
  - ✅ Chat support (có delay 3-5s)
  - ✅ AI Groq
  - ✅ Upload meter readings

---

## Lưu Ý Quan Trọng

### Upload Files trên Vercel
Vercel serverless chỉ cho phép ghi vào `/tmp` và files sẽ bị xóa sau mỗi request. 

**Giải pháp**:
1. Dùng Cloudinary/AWS S3 cho file storage (khuyến khích)
2. Hoặc dùng Vercel Blob Storage

### Chat Support Delay
- HTTP Polling có delay 3-5 giây
- Không real-time như Socket.io
- Nếu cần real-time, phải dùng Railway cho backend

### MongoDB Atlas IP Whitelist
- Vercel dùng dynamic IPs
- Phải whitelist `0.0.0.0/0` (allow all) trong MongoDB Atlas
- Hoặc dùng MongoDB Atlas Serverless

---

## Chi Phí

### Vercel
- **Hobby Plan**: Free
  - 100GB bandwidth/tháng
  - Unlimited requests
  - Đủ cho app nhỏ-trung

- **Pro Plan**: $20/tháng
  - 1TB bandwidth
  - Cần khi traffic cao

### Tenten.vn
- Domain `.vn`: ~400,000 VNĐ/năm

### MongoDB Atlas
- Free tier: 512MB (đang dùng)

**Tổng chi phí**: ~400,000 VNĐ/năm (chỉ domain)

---

## Troubleshooting

### Lỗi 504 Gateway Timeout
- Vercel function timeout: 10s (Hobby) / 60s (Pro)
- Tối ưu API calls để < 10s

### Upload Files lỗi
- Vercel không lưu files persistent
- Phải dùng external storage (Cloudinary/S3)

### Chat không cập nhật
- Kiểm tra polling interval (3 giây)
- Kiểm tra browser console logs
- Kiểm tra Network tab

---

## So Sánh: Vercel vs Railway

| Tiêu chí | 100% Vercel | Railway + Vercel |
|----------|-------------|------------------|
| Real-time Chat | ❌ (delay 3-5s) | ✅ |
| File Upload | ⚠️ Cần external storage | ✅ |
| Setup | ✅ Đơn giản hơn | ⚠️ 2 deployments |
| Chi phí | ✅ Free | ✅ Free (trong tier) |
| Scalability | ✅ Tốt | ✅ Tốt |

**Khuyến nghị**: Nếu cần real-time chat và file upload đơn giản, dùng Railway + Vercel tốt hơn.

---

**Chúc bạn deploy thành công! 🚀**
