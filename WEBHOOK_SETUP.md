# Setup Webhook cho PayOS (Development)

## Vấn đề hiện tại
- PayOS webhook không thể gọi đến `localhost:3000`
- Sau khi thanh toán, phải chạy script manual để complete payment
- Không tự động như production

## Giải pháp: Dùng ngrok

### Bước 1: Cài đặt ngrok
```bash
# macOS
brew install ngrok

# Hoặc download từ: https://ngrok.com/download
```

### Bước 2: Đăng ký tài khoản ngrok (Free)
1. Truy cập: https://dashboard.ngrok.com/signup
2. Đăng ký tài khoản miễn phí
3. Copy authtoken từ dashboard

### Bước 3: Setup ngrok
```bash
# Add authtoken
ngrok config add-authtoken YOUR_AUTH_TOKEN
```

### Bước 4: Chạy ngrok
```bash
# Expose port 3000
ngrok http 3000
```

Bạn sẽ thấy output như:
```
Forwarding  https://abc123.ngrok-free.app -> http://localhost:3000
```

### Bước 5: Config PayOS Webhook
1. Truy cập PayOS Dashboard: https://my.payos.vn
2. Vào Settings → Webhook
3. Update Webhook URL thành: `https://abc123.ngrok-free.app/api/payment/webhook`
4. Save

### Bước 6: Test
1. Giữ ngrok chạy (không tắt terminal)
2. Thử thanh toán một gói
3. Sau khi thanh toán thành công, webhook sẽ tự động được gọi
4. Subscription sẽ tự động được tạo
5. Các chức năng sẽ tự động mở

## Lưu ý
- Mỗi lần restart ngrok, URL sẽ thay đổi (free plan)
- Phải update lại webhook URL trong PayOS mỗi lần restart
- Để có URL cố định, cần upgrade ngrok plan (paid)

## Alternative: Deploy Backend
Thay vì dùng ngrok, có thể deploy backend lên:
- Vercel: https://vercel.com
- Railway: https://railway.app
- Render: https://render.com

Sau đó config webhook URL là URL production.

## Kiểm tra webhook có hoạt động không
Xem backend console log, khi thanh toán thành công sẽ thấy:
```
📥 Received webhook: {...}
✅ Payment verified for order 123456
📦 Found pending payment: {...}
💾 Created subscription: {...}
👤 Updated user subscription
🎟️  Marked voucher as used
🗑️  Deleted pending payment record
✅ Payment processing completed for order 123456
```

## Troubleshooting
- Nếu không thấy log webhook → PayOS chưa gọi được đến backend
- Kiểm tra ngrok có đang chạy không
- Kiểm tra webhook URL trong PayOS có đúng không
- Thử test webhook bằng PayOS dashboard
