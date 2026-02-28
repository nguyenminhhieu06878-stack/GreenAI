# Hướng Dẫn Deploy GreenEnergy AI

## Tổng Quan Kiến Trúc

- **Frontend**: Vercel (React + Vite)
- **Backend**: Railway (Node.js + Express + Socket.io)
- **Database**: MongoDB Atlas (đã cấu hình)
- **Tên miền**: 1 domain từ Tenten.vn + 1 subdomain miễn phí

Ví dụ:
- Frontend: `https://greenenergy.vn`
- Backend API: `https://api.greenenergy.vn`

---

## Bước 1: Chuẩn Bị Tên Miền (Tenten.vn)

### 1.1. Mua tên miền
- Truy cập [Tenten.vn](https://tenten.vn)
- Mua 1 tên miền (ví dụ: `greenenergy.vn`)
- Subdomain `api.greenenergy.vn` sẽ tạo miễn phí

### 1.2. Cấu hình DNS (làm sau khi deploy)
Sẽ cấu hình sau khi có URL từ Vercel và Railway

---

## Bước 2: Deploy Backend lên Railway

### 2.1. Tạo tài khoản Railway
1. Truy cập [Railway.app](https://railway.app)
2. Đăng ký/Đăng nhập bằng GitHub

### 2.2. Deploy Backend
1. Click "New Project" → "Deploy from GitHub repo"
2. Chọn repository của bạn
3. Railway sẽ tự động detect và deploy

### 2.3. Cấu hình Environment Variables
Vào tab "Variables" và thêm các biến sau:

```env
NODE_ENV=production
PORT=3000

# JWT
JWT_SECRET=your-production-secret-key-change-this
JWT_EXPIRES_IN=7d

# MongoDB Atlas
MONGODB_URI=mongodb+srv://quocbao:Hieunguyen1002@cluster0.segxwna.mongodb.net/greenenergy?retryWrites=true&w=majority&appName=Cluster0

# Upload
UPLOAD_DIR=uploads
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

# URLs - CẬP NHẬT SAU KHI CÓ TÊN MIỀN
CORS_ORIGIN=https://greenenergy.vn
FRONTEND_URL=https://greenenergy.vn
GOOGLE_CALLBACK_URL=https://api.greenenergy.vn/api/auth/google/callback
PAYOS_RETURN_URL=https://greenenergy.vn/thanh-toan/thanh-cong
PAYOS_CANCEL_URL=https://greenenergy.vn/thanh-toan/that-bai
```

### 2.4. Lấy Railway URL
1. Sau khi deploy xong, Railway sẽ tạo URL tự động (ví dụ: `https://your-app.railway.app`)
2. Copy URL này để cấu hình custom domain

### 2.5. Cấu hình Custom Domain
1. Vào tab "Settings" → "Domains"
2. Click "Custom Domain"
3. Nhập: `api.greenenergy.vn`
4. Railway sẽ cho bạn CNAME record để cấu hình DNS

**Ghi chú CNAME từ Railway** (ví dụ):
```
Type: CNAME
Name: api
Value: your-app.railway.app
```

---

## Bước 3: Deploy Frontend lên Vercel

### 3.1. Tạo tài khoản Vercel
1. Truy cập [Vercel.com](https://vercel.com)
2. Đăng ký/Đăng nhập bằng GitHub

### 3.2. Deploy Frontend
1. Click "Add New" → "Project"
2. Import repository của bạn
3. Cấu hình:
   - **Framework Preset**: Vite
   - **Root Directory**: `apps/frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 3.3. Cấu hình Environment Variables
Vào tab "Settings" → "Environment Variables":

```env
VITE_API_URL=https://api.greenenergy.vn
```

### 3.4. Lấy Vercel URL
- Sau khi deploy, Vercel tạo URL tự động (ví dụ: `https://your-app.vercel.app`)

### 3.5. Cấu hình Custom Domain
1. Vào tab "Settings" → "Domains"
2. Nhập: `greenenergy.vn` và `www.greenenergy.vn`
3. Vercel sẽ cho bạn DNS records để cấu hình

**Ghi chú DNS từ Vercel** (ví dụ):
```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

---

## Bước 4: Cấu hình DNS tại Tenten.vn

### 4.1. Đăng nhập Tenten.vn
1. Vào quản lý tên miền
2. Chọn domain `greenenergy.vn`
3. Vào "Quản lý DNS"

### 4.2. Thêm DNS Records

**Cho Frontend (Vercel):**
```
Type: A
Host: @
Value: 76.76.21.21
TTL: 3600
```

```
Type: CNAME
Host: www
Value: cname.vercel-dns.com
TTL: 3600
```

**Cho Backend (Railway):**
```
Type: CNAME
Host: api
Value: your-app.railway.app
TTL: 3600
```

### 4.3. Chờ DNS Propagation
- Thời gian: 5-30 phút
- Kiểm tra: `nslookup greenenergy.vn` và `nslookup api.greenenergy.vn`

---

## Bước 5: Cập Nhật Cấu Hình Sau Khi Có Domain

### 5.1. Cập nhật Railway Environment Variables
```env
CORS_ORIGIN=https://greenenergy.vn
FRONTEND_URL=https://greenenergy.vn
GOOGLE_CALLBACK_URL=https://api.greenenergy.vn/api/auth/google/callback
PAYOS_RETURN_URL=https://greenenergy.vn/thanh-toan/thanh-cong
PAYOS_CANCEL_URL=https://greenenergy.vn/thanh-toan/that-bai
```

### 5.2. Cập nhật Google OAuth Console
1. Truy cập [Google Cloud Console](https://console.cloud.google.com)
2. Vào "APIs & Services" → "Credentials"
3. Chọn OAuth 2.0 Client ID của bạn
4. Thêm vào "Authorized redirect URIs":
   ```
   https://api.greenenergy.vn/api/auth/google/callback
   ```
5. Thêm vào "Authorized JavaScript origins":
   ```
   https://greenenergy.vn
   https://api.greenenergy.vn
   ```

### 5.3. Cập nhật PayOS Webhook
1. Đăng nhập [PayOS Dashboard](https://my.payos.vn)
2. Vào "Cài đặt" → "Webhook"
3. Cập nhật Webhook URL:
   ```
   https://api.greenenergy.vn/api/payment/webhook
   ```

---

## Bước 6: Kiểm Tra Deployment

### 6.1. Test Backend
```bash
curl https://api.greenenergy.vn/api/health
```
Kết quả mong đợi:
```json
{
  "status": "ok",
  "message": "GreenEnergy AI API is running"
}
```

### 6.2. Test Frontend
- Truy cập: `https://greenenergy.vn`
- Kiểm tra các chức năng:
  - ✅ Đăng ký/Đăng nhập
  - ✅ Google OAuth
  - ✅ Thanh toán PayOS
  - ✅ Chat support (Socket.io)
  - ✅ AI Groq
  - ✅ Upload meter readings

### 6.3. Test Socket.io Chat
1. Mở trang Support
2. Gửi tin nhắn
3. Kiểm tra real-time response

---

## Troubleshooting

### Lỗi CORS
**Triệu chứng**: `Access-Control-Allow-Origin` error

**Giải pháp**:
1. Kiểm tra `CORS_ORIGIN` trong Railway
2. Đảm bảo giá trị là: `https://greenenergy.vn` (không có dấu `/` cuối)

### Socket.io không kết nối
**Triệu chứng**: Chat không hoạt động

**Giải pháp**:
1. Kiểm tra Railway logs: `railway logs`
2. Đảm bảo Socket.io đang dùng polling mode (đã cấu hình)
3. Kiểm tra CORS origin

### Google OAuth lỗi redirect_uri_mismatch
**Triệu chứng**: Lỗi khi đăng nhập Google

**Giải pháp**:
1. Kiểm tra Google Cloud Console
2. Đảm bảo redirect URI chính xác: `https://api.greenenergy.vn/api/auth/google/callback`

### PayOS webhook không hoạt động
**Triệu chứng**: Thanh toán thành công nhưng không mở chức năng

**Giải pháp**:
1. Kiểm tra PayOS Dashboard webhook URL
2. Kiểm tra Railway logs để xem webhook có nhận được không
3. Test webhook: `curl -X POST https://api.greenenergy.vn/api/payment/webhook`

---

## Chi Phí Dự Kiến

### Tenten.vn
- Tên miền `.vn`: ~400,000 VNĐ/năm
- Subdomain: Miễn phí

### Railway
- Free tier: $5 credit/tháng (đủ cho app nhỏ)
- Hobby plan: $5/tháng (unlimited usage)

### Vercel
- Free tier: Unlimited (đủ cho hầu hết projects)
- Pro: $20/tháng (nếu cần nhiều bandwidth)

### MongoDB Atlas
- Free tier: 512MB (đang dùng)
- Paid: Từ $9/tháng

**Tổng chi phí tối thiểu**: ~400,000 VNĐ/năm (chỉ tên miền)

---

## Lưu Ý Quan Trọng

1. **Bảo mật JWT_SECRET**: Đổi sang giá trị mạnh hơn cho production
2. **MongoDB**: Đảm bảo IP whitelist cho Railway
3. **Backup**: Thiết lập backup tự động cho MongoDB
4. **Monitoring**: Sử dụng Railway logs và Vercel analytics
5. **SSL**: Vercel và Railway tự động cấp SSL certificate

---

## Hỗ Trợ

Nếu gặp vấn đề:
1. Kiểm tra Railway logs: `railway logs`
2. Kiểm tra Vercel logs trong dashboard
3. Kiểm tra browser console (F12)
4. Kiểm tra Network tab để xem API calls

---

**Chúc bạn deploy thành công! 🚀**
