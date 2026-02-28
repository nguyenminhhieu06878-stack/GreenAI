# Hướng Dẫn Tích Hợp Google OAuth

## Tổng Quan
Tài liệu này hướng dẫn cách thiết lập Google OAuth để cho phép người dùng đăng nhập bằng tài khoản Google.

## Bước 1: Tạo Google Cloud Project

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới hoặc chọn project hiện có
3. Đảm bảo project đã được kích hoạt

## Bước 2: Cấu Hình OAuth Consent Screen

1. Vào **APIs & Services** > **OAuth consent screen**
2. Chọn **External** (cho phép bất kỳ ai có tài khoản Google đăng nhập)
3. Điền thông tin:
   - **App name**: GreenEnergyAI
   - **User support email**: Email của bạn
   - **Developer contact information**: Email của bạn
4. Thêm scopes:
   - `userinfo.email`
   - `userinfo.profile`
5. Thêm test users (nếu app đang ở chế độ testing)
6. Lưu và tiếp tục

## Bước 3: Tạo OAuth 2.0 Credentials

1. Vào **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. Chọn **Application type**: Web application
4. Điền thông tin:
   - **Name**: GreenEnergyAI Web Client
   - **Authorized JavaScript origins**:
     - `http://localhost:5174` (development)
     - `https://yourdomain.com` (production)
   - **Authorized redirect URIs**:
     - `http://localhost:3000/api/auth/google/callback` (development)
     - `https://api.yourdomain.com/api/auth/google/callback` (production)
5. Click **Create**
6. Lưu lại **Client ID** và **Client Secret**

## Bước 4: Cấu Hình Backend

Cập nhật file `apps/backend/.env`:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback
FRONTEND_URL=http://localhost:5174
```

## Bước 5: Restart Backend Server

```bash
cd apps/backend
npm run dev
```

Backend sẽ tự động phát hiện credentials và kích hoạt Google OAuth.

## Bước 6: Test Google Login

1. Mở trình duyệt và truy cập `http://localhost:5174/login`
2. Click nút "Đăng nhập bằng Google"
3. Chọn tài khoản Google
4. Cho phép quyền truy cập
5. Bạn sẽ được redirect về trang chủ với trạng thái đã đăng nhập

## Luồng Hoạt Động

```
User clicks "Đăng nhập bằng Google"
    ↓
Redirect to Google OAuth (http://localhost:3000/api/auth/google)
    ↓
User authenticates with Google
    ↓
Google redirects to callback URL with auth code
    ↓
Backend exchanges code for user info
    ↓
Backend creates/updates user in database
    ↓
Backend generates JWT token
    ↓
Redirect to frontend with token (http://localhost:5174/auth/callback?token=xxx)
    ↓
Frontend saves token and fetches user data
    ↓
User is logged in
```

## Xử Lý Lỗi

### Lỗi: "OAuth2Strategy requires a clientID option"
- Kiểm tra file `.env` đã có `GOOGLE_CLIENT_ID` và `GOOGLE_CLIENT_SECRET`
- Restart backend server

### Lỗi: "redirect_uri_mismatch"
- Kiểm tra redirect URI trong Google Cloud Console khớp với `GOOGLE_CALLBACK_URL`
- Đảm bảo không có trailing slash

### Lỗi: "Access blocked: This app's request is invalid"
- Kiểm tra OAuth consent screen đã được cấu hình đúng
- Thêm email test user nếu app đang ở chế độ testing

## Production Deployment

Khi deploy lên production:

1. Cập nhật Authorized JavaScript origins và redirect URIs trong Google Cloud Console
2. Cập nhật `.env` với domain production:
   ```env
   GOOGLE_CALLBACK_URL=https://api.yourdomain.com/api/auth/google/callback
   FRONTEND_URL=https://yourdomain.com
   ```
3. Chuyển OAuth consent screen sang chế độ "In production" (nếu cần)

## Bảo Mật

- Không commit file `.env` vào Git
- Sử dụng environment variables cho production
- Giữ `GOOGLE_CLIENT_SECRET` bí mật
- Chỉ thêm trusted domains vào authorized origins

## Tính Năng

✅ Đăng nhập bằng Google  
✅ Tự động tạo user mới nếu chưa tồn tại  
✅ Link Google account với user hiện có  
✅ JWT token authentication  
✅ Redirect về frontend sau khi đăng nhập  
✅ Xử lý lỗi và fallback  

## Hỗ Trợ

Nếu gặp vấn đề, kiểm tra:
- Backend logs: `apps/backend` terminal
- Frontend console: Browser DevTools
- Google Cloud Console: Credentials và OAuth consent screen
