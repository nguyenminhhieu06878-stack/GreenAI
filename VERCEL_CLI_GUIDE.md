# Hướng Dẫn Deploy Lên Vercel Bằng CLI

## Bước 1: Cài Đặt Vercel CLI (Đã có ✅)

```bash
# Kiểm tra
vercel --version
```

Nếu chưa có:
```bash
npm install -g vercel
```

---

## Bước 2: Đăng Nhập Vercel

```bash
vercel login
```

Chọn phương thức đăng nhập (GitHub/GitLab/Email).

---

## Bước 3: Deploy Backend

### 3.1. Di chuyển vào thư mục backend
```bash
cd apps/backend
```

### 3.2. Cài dependencies và build
```bash
npm install
npm run build
```

### 3.3. Deploy lên Vercel
```bash
vercel --prod
```

**Trong quá trình deploy, Vercel sẽ hỏi:**

1. **Set up and deploy?** → `Y`
2. **Which scope?** → Chọn account của bạn
3. **Link to existing project?** → `N` (lần đầu)
4. **What's your project's name?** → `greenenergy-backend`
5. **In which directory is your code located?** → `./` (đã ở trong apps/backend)
6. **Want to override the settings?** → `N`

### 3.4. Lấy Backend URL
Sau khi deploy xong, Vercel sẽ hiển thị URL:
```
✅ Production: https://greenenergy-backend.vercel.app
```

**Copy URL này để dùng cho frontend!**

### 3.5. Cấu hình Environment Variables
```bash
# Cách 1: Qua CLI
vercel env add NODE_ENV
# Nhập: production

vercel env add MONGODB_URI
# Nhập: mongodb+srv://quocbao:Hieunguyen1002@cluster0.segxwna.mongodb.net/greenenergy?retryWrites=true&w=majority&appName=Cluster0

vercel env add JWT_SECRET
# Nhập: your-production-secret-key-change-this

vercel env add JWT_EXPIRES_IN
# Nhập: 7d

vercel env add UPLOAD_DIR
# Nhập: /tmp/uploads

vercel env add MAX_FILE_SIZE
# Nhập: 5242880

vercel env add GROQ_API_KEY
# Nhập: your-groq-api-key-here

vercel env add PAYOS_CLIENT_ID
# Nhập: c6b38db6-d4b5-47d7-8dd7-9d295ece27a3

vercel env add PAYOS_API_KEY
# Nhập: 8909c3a3-d25a-4eb8-8a09-64426e4616be

vercel env add PAYOS_CHECKSUM_KEY
# Nhập: 3bb07e9c6e00c4699b49b5f28ec2d095783286360de53a0442a187f820bbd16f

vercel env add GOOGLE_CLIENT_ID
# Nhập: your-google-client-id.apps.googleusercontent.com

vercel env add GOOGLE_CLIENT_SECRET
# Nhập: your-google-client-secret

vercel env add CORS_ORIGIN
# Nhập: https://greenenergy-frontend.vercel.app (sẽ cập nhật sau)

vercel env add FRONTEND_URL
# Nhập: https://greenenergy-frontend.vercel.app (sẽ cập nhật sau)

vercel env add GOOGLE_CALLBACK_URL
# Nhập: https://greenenergy-backend.vercel.app/api/auth/google/callback

vercel env add PAYOS_RETURN_URL
# Nhập: https://greenenergy-frontend.vercel.app/thanh-toan/thanh-cong

vercel env add PAYOS_CANCEL_URL
# Nhập: https://greenenergy-frontend.vercel.app/thanh-toan/that-bai
```

**Cách 2: Qua Dashboard (Dễ hơn)**
1. Vào https://vercel.com/dashboard
2. Chọn project `greenenergy-backend`
3. Settings → Environment Variables
4. Thêm tất cả biến ở trên

### 3.6. Redeploy sau khi thêm env vars
```bash
vercel --prod
```

---

## Bước 4: Deploy Frontend

### 4.1. Di chuyển vào thư mục frontend
```bash
cd ../frontend
```

### 4.2. Cài dependencies
```bash
npm install
```

### 4.3. Deploy lên Vercel
```bash
vercel --prod
```

**Trong quá trình deploy:**

1. **Set up and deploy?** → `Y`
2. **Which scope?** → Chọn account của bạn
3. **Link to existing project?** → `N` (lần đầu)
4. **What's your project's name?** → `greenenergy-frontend`
5. **In which directory is your code located?** → `./`
6. **Want to override the settings?** → `Y`
7. **Which settings would you like to override?**
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Development Command**: `npm run dev`

### 4.4. Cấu hình Environment Variables
```bash
vercel env add VITE_API_URL
# Nhập: https://greenenergy-backend.vercel.app
```

Hoặc qua Dashboard:
1. Vào https://vercel.com/dashboard
2. Chọn project `greenenergy-frontend`
3. Settings → Environment Variables
4. Thêm: `VITE_API_URL` = `https://greenenergy-backend.vercel.app`

### 4.5. Redeploy
```bash
vercel --prod
```

---

## Bước 5: Cập Nhật Backend CORS

Sau khi có frontend URL, cập nhật backend env vars:

```bash
cd ../backend
vercel env rm CORS_ORIGIN production
vercel env add CORS_ORIGIN
# Nhập: https://greenenergy-frontend.vercel.app

vercel env rm FRONTEND_URL production
vercel env add FRONTEND_URL
# Nhập: https://greenenergy-frontend.vercel.app

vercel env rm PAYOS_RETURN_URL production
vercel env add PAYOS_RETURN_URL
# Nhập: https://greenenergy-frontend.vercel.app/thanh-toan/thanh-cong

vercel env rm PAYOS_CANCEL_URL production
vercel env add PAYOS_CANCEL_URL
# Nhập: https://greenenergy-frontend.vercel.app/thanh-toan/that-bai

# Redeploy
vercel --prod
```

---

## Bước 6: Cấu Hình Custom Domain (Tùy chọn)

### 6.1. Thêm domain cho Frontend
```bash
cd ../frontend
vercel domains add greenenergy.vn
vercel domains add www.greenenergy.vn
```

### 6.2. Thêm domain cho Backend
```bash
cd ../backend
vercel domains add api.greenenergy.vn
```

### 6.3. Cấu hình DNS tại Tenten.vn
Vercel sẽ cho bạn DNS records, thêm vào Tenten.vn:

**Frontend:**
```
Type: A
Host: @
Value: 76.76.21.21

Type: CNAME
Host: www
Value: cname.vercel-dns.com
```

**Backend:**
```
Type: CNAME
Host: api
Value: cname.vercel-dns.com
```

### 6.4. Cập nhật Environment Variables với custom domain
```bash
# Backend
cd ../backend
vercel env rm CORS_ORIGIN production
vercel env add CORS_ORIGIN
# Nhập: https://greenenergy.vn

vercel env rm FRONTEND_URL production
vercel env add FRONTEND_URL
# Nhập: https://greenenergy.vn

vercel env rm GOOGLE_CALLBACK_URL production
vercel env add GOOGLE_CALLBACK_URL
# Nhập: https://api.greenenergy.vn/api/auth/google/callback

vercel env rm PAYOS_RETURN_URL production
vercel env add PAYOS_RETURN_URL
# Nhập: https://greenenergy.vn/thanh-toan/thanh-cong

vercel env rm PAYOS_CANCEL_URL production
vercel env add PAYOS_CANCEL_URL
# Nhập: https://greenenergy.vn/thanh-toan/that-bai

vercel --prod

# Frontend
cd ../frontend
vercel env rm VITE_API_URL production
vercel env add VITE_API_URL
# Nhập: https://api.greenenergy.vn

vercel --prod
```

---

## Bước 7: Cập Nhật Google OAuth & PayOS

### 7.1. Google OAuth
1. Vào [Google Cloud Console](https://console.cloud.google.com)
2. APIs & Services → Credentials
3. Chọn OAuth 2.0 Client ID
4. Thêm Authorized redirect URIs:
   ```
   https://api.greenenergy.vn/api/auth/google/callback
   ```
5. Thêm Authorized JavaScript origins:
   ```
   https://greenenergy.vn
   https://api.greenenergy.vn
   ```

### 7.2. PayOS Webhook
1. Vào [PayOS Dashboard](https://my.payos.vn)
2. Cài đặt → Webhook
3. Cập nhật URL:
   ```
   https://api.greenenergy.vn/api/payment/webhook
   ```

---

## Bước 8: Kiểm Tra Deployment

### 8.1. Test Backend
```bash
curl https://api.greenenergy.vn/api/health
# hoặc
curl https://greenenergy-backend.vercel.app/api/health
```

Kết quả:
```json
{
  "status": "ok",
  "message": "GreenEnergy AI API is running"
}
```

### 8.2. Test Frontend
Mở browser:
```
https://greenenergy.vn
# hoặc
https://greenenergy-frontend.vercel.app
```

---

## Các Lệnh Hữu Ích

### Xem danh sách projects
```bash
vercel ls
```

### Xem logs
```bash
vercel logs greenenergy-backend
vercel logs greenenergy-frontend
```

### Xem environment variables
```bash
vercel env ls
```

### Xóa project
```bash
vercel remove greenenergy-backend
```

### Rollback deployment
```bash
vercel rollback
```

### Xem domains
```bash
vercel domains ls
```

---

## Script Tự Động (Khuyến khích)

Tôi đã tạo script `deploy-vercel.sh` để tự động hóa:

```bash
bash deploy-vercel.sh
```

Chọn:
- `1` - Deploy Backend
- `2` - Deploy Frontend
- `3` - Deploy cả hai

---

## Troubleshooting

### Lỗi: "No framework detected"
```bash
vercel --prod --build-env FRAMEWORK=vite
```

### Lỗi: "Build failed"
Kiểm tra:
1. `npm run build` có chạy được local không?
2. Dependencies đã được cài đầy đủ chưa?
3. Environment variables đã đúng chưa?

### Lỗi: "Function timeout"
Vercel free tier có timeout 10s. Tối ưu API calls.

### Lỗi CORS
Kiểm tra `CORS_ORIGIN` trong backend env vars.

---

## Chi Phí

- **Vercel Hobby**: Free
  - 100GB bandwidth/tháng
  - Unlimited deployments
  - Đủ cho app nhỏ-trung

---

**Chúc bạn deploy thành công! 🚀**
