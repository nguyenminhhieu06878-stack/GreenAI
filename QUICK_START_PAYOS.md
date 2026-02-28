# 🚀 Quick Start - PayOS Payment Integration

## ✅ Đã Hoàn Thành
Tích hợp PayOS với voucher support đã hoàn thành 100%!

## ⚠️ Cần Làm Ngay

### Bước 1: Lấy Checksum Key
1. Truy cập https://payos.vn
2. Đăng nhập với tài khoản của bạn
3. Vào **Settings** > **API Keys**
4. Copy **Checksum Key**
5. Mở file `apps/backend/.env`
6. Thay thế dòng này:
   ```env
   PAYOS_CHECKSUM_KEY=your_checksum_key_here
   ```
   Thành:
   ```env
   PAYOS_CHECKSUM_KEY=<checksum_key_bạn_vừa_copy>
   ```

### Bước 2: Chạy Ứng Dụng

**Terminal 1 - Backend:**
```bash
cd apps/backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd apps/frontend
npm run dev
```

### Bước 3: Test Thanh Toán

1. Mở trình duyệt: http://localhost:5173
2. Đăng nhập (hoặc đăng ký tài khoản mới)
3. Vào trang **Bảng Giá** (menu bên trái)
4. Chọn một gói trả phí (ví dụ: Gói Cơ Bản - 29,000đ)
5. (Tùy chọn) Nhập mã voucher nếu có
6. Click **Đăng ký ngay**
7. Click **Xác Nhận** trong modal
8. Bạn sẽ được chuyển đến trang thanh toán PayOS
9. Hoàn tất thanh toán
10. Sau khi thanh toán, bạn sẽ được chuyển về trang thành công
11. Kiểm tra gói đã được kích hoạt trong **Cài Đặt**

## 🎮 Lấy Mã Voucher

Để có mã giảm giá:
1. Vào trang **Điểm Danh** (menu bên trái)
2. Click vào cây 3D để điểm danh
3. Sau khi điểm danh đủ ngày, bạn sẽ nhận được voucher
4. Xem voucher trong modal hoặc trang **Thành Tích**
5. Copy mã voucher và dùng khi mua gói

## 📊 Kiểm Tra Kết Quả

### Kiểm tra subscription đã được tạo:
```bash
cd apps/backend
node -e "
const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://quocbao:Hieunguyen1002@cluster0.segxwna.mongodb.net/greenenergy')
  .then(() => mongoose.connection.db.collection('subscriptions').find({}).toArray())
  .then(subs => console.log(JSON.stringify(subs, null, 2)))
  .then(() => process.exit(0))
"
```

### Kiểm tra user đã được update:
```bash
cd apps/backend
node -e "
const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://quocbao:Hieunguyen1002@cluster0.segxwna.mongodb.net/greenenergy')
  .then(() => mongoose.connection.db.collection('users').find({role: 'tenant'}).toArray())
  .then(users => console.log(JSON.stringify(users.map(u => ({
    name: u.name,
    email: u.email,
    subscriptionPlan: u.subscriptionPlan,
    subscriptionStatus: u.subscriptionStatus
  })), null, 2)))
  .then(() => process.exit(0))
"
```

## 🔧 Troubleshooting

### Lỗi: "Failed to create payment"
- Kiểm tra Checksum Key đã đúng chưa
- Kiểm tra backend đang chạy
- Xem console log trong terminal backend

### Lỗi: "Mã voucher không hợp lệ"
- Kiểm tra voucher chưa được sử dụng
- Kiểm tra voucher chưa hết hạn
- Kiểm tra voucher thuộc về user đang đăng nhập

### Webhook không hoạt động (local)
- Cần dùng ngrok để expose local server
- Cấu hình webhook URL trong PayOS Dashboard

## 📝 API Endpoints

### Payment APIs
- `POST /api/payment/create` - Tạo thanh toán
- `POST /api/payment/webhook` - Webhook từ PayOS
- `GET /api/payment/status/:orderCode` - Kiểm tra trạng thái
- `POST /api/payment/validate-voucher` - Validate voucher

### Frontend Routes
- `/bang-gia` - Trang bảng giá
- `/thanh-toan/thanh-cong` - Trang thanh toán thành công
- `/thanh-toan/that-bai` - Trang thanh toán thất bại

## 🎯 Features

✅ Thanh toán qua PayOS (Momo, VNPay, Banking)
✅ Hỗ trợ mã giảm giá từ check-in game
✅ Tự động kích hoạt gói sau thanh toán
✅ Webhook xác minh thanh toán
✅ Trang success/failure
✅ Gói miễn phí không cần thanh toán
✅ Tính toán giá sau giảm giá
✅ Đánh dấu voucher đã sử dụng

## 📚 Documentation

- `PAYOS_INTEGRATION.md` - Hướng dẫn chi tiết
- `PAYOS_IMPLEMENTATION_SUMMARY.md` - Tóm tắt implementation
- `QUICK_START_PAYOS.md` - File này

## 🚀 Production Deployment

Khi deploy lên production:
1. Update environment variables với production URLs
2. Cấu hình webhook URL trong PayOS Dashboard
3. Test với real payment
4. Monitor logs và transactions

---

**Chúc bạn test thành công! 🎉**
