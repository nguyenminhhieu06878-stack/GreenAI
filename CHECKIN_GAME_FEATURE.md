# Tính Năng Game Điểm Danh - Nuôi Cây Xanh

## Tổng Quan
Tính năng game hóa khuyến khích người dùng điểm danh hàng ngày bằng cách nuôi cây xanh ảo. Khi điểm danh đủ 25 ngày liên tục, người dùng sẽ nhận được voucher giảm 50% khi mua gói dịch vụ.

## Cơ Chế Hoạt Động

### 1. Điểm Danh Hàng Ngày
- Người dùng có thể điểm danh 1 lần mỗi ngày
- Mỗi lần điểm danh thành công sẽ tăng chuỗi (streak) lên 1
- Nếu bỏ lỡ 1 ngày, chuỗi sẽ reset về 0

### 2. Giai Đoạn Phát Triển Cây
Cây sẽ phát triển qua các giai đoạn dựa trên số ngày điểm danh liên tục:

| Streak | Giai Đoạn | Emoji | Màu Sắc |
|--------|-----------|-------|---------|
| 0 | Hạt giống | 🌱 | Xám |
| 1-4 | Mầm non | 🌱 | Xanh nhạt |
| 5-9 | Cây con | 🌿 | Xanh |
| 10-14 | Cây nhỏ | 🌳 | Xanh đậm |
| 15-19 | Cây lớn | 🌲 | Xanh đậm hơn |
| 20-24 | Cây to | 🌴 | Xanh rất đậm |
| 25+ | Cây khổng lồ | 🎄 | Xanh tối |

### 3. Mốc Thưởng
- **5 ngày**: Cây con 🌿
- **10 ngày**: Cây nhỏ 🌳
- **15 ngày**: Cây lớn 🌲
- **20 ngày**: Cây to 🌴
- **25 ngày**: Voucher giảm 50% 🎁

### 4. Voucher
Khi đạt 25 ngày điểm danh liên tục:
- Tự động tạo voucher giảm 50%
- Mã voucher: `TREE25-[USER_ID]-[TIMESTAMP]`
- Thời hạn: 30 ngày kể từ khi nhận
- Áp dụng cho tất cả các gói dịch vụ

## API Endpoints

### GET /api/checkin/status
Lấy trạng thái điểm danh của user

**Response:**
```json
{
  "streak": 5,
  "totalCheckIns": 10,
  "lastCheckIn": "2026-02-27T10:00:00.000Z",
  "canCheckIn": true,
  "vouchers": [
    {
      "_id": "...",
      "code": "TREE25-ABC123-4567",
      "discount": 50,
      "type": "check-in",
      "isUsed": false,
      "expiresAt": "2026-03-29T10:00:00.000Z"
    }
  ]
}
```

### POST /api/checkin/check-in
Thực hiện điểm danh

**Response:**
```json
{
  "message": "Điểm danh thành công!",
  "streak": 6,
  "totalCheckIns": 11,
  "voucherCreated": false
}
```

Khi đạt 25 ngày:
```json
{
  "message": "Điểm danh thành công!",
  "streak": 25,
  "totalCheckIns": 25,
  "voucherCreated": true,
  "voucherMessage": "🎉 Chúc mừng! Bạn nhận được voucher giảm 50%!"
}
```

### GET /api/checkin/vouchers
Lấy danh sách voucher của user

**Response:**
```json
{
  "vouchers": [
    {
      "_id": "...",
      "userId": "...",
      "code": "TREE25-ABC123-4567",
      "discount": 50,
      "type": "check-in",
      "isUsed": false,
      "usedAt": null,
      "expiresAt": "2026-03-29T10:00:00.000Z",
      "createdAt": "2026-02-27T10:00:00.000Z"
    }
  ]
}
```

## Database Models

### CheckIn Model
```typescript
{
  userId: ObjectId,
  checkInDate: Date,
  streak: Number,
  totalCheckIns: Number,
  lastCheckIn: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Voucher Model
```typescript
{
  userId: ObjectId,
  code: String,
  discount: Number, // percentage (0-100)
  type: 'check-in' | 'promotion',
  isUsed: Boolean,
  usedAt: Date,
  expiresAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## Frontend Components

### CheckIn Page (`/diem-danh`)
- Hiển thị cây xanh với animation
- Thanh tiến độ (progress bar)
- Nút điểm danh
- Danh sách mốc thưởng
- Danh sách voucher
- Mẹo nuôi cây

### Features
- Animation cây nhảy nhẹ (bounce)
- Hiệu ứng lấp lánh khi đạt 25 ngày
- Responsive design
- Toast notifications

## Cách Sử Dụng

### Cho Người Dùng
1. Truy cập trang "Điểm Danh" từ menu
2. Nhấn nút "Điểm danh hôm nay"
3. Theo dõi cây phát triển qua các ngày
4. Nhận voucher khi đạt 25 ngày liên tục
5. Sử dụng voucher khi mua gói dịch vụ

### Cho Admin
- Admin có thể xem thống kê điểm danh của users
- Có thể tạo voucher thủ công cho users
- Quản lý vouchers đã phát hành

## Lưu Ý Kỹ Thuật

### Xử Lý Streak
- Streak chỉ tăng khi điểm danh vào ngày hôm sau ngày điểm danh cuối
- Nếu bỏ lỡ 1 ngày, streak reset về 1 (không phải 0)
- Không thể điểm danh nhiều lần trong 1 ngày

### Tạo Voucher
- Chỉ tạo voucher 1 lần khi đạt 25 ngày
- Kiểm tra xem user đã có voucher trong 30 ngày gần đây chưa
- Voucher có thời hạn 30 ngày

### Performance
- Index trên `userId` trong CheckIn và Voucher models
- Cache check-in status để giảm database queries
- Lazy load voucher list

## Tương Lai

### Tính Năng Mở Rộng
- [ ] Thêm nhiều loại cây khác nhau
- [ ] Leaderboard điểm danh
- [ ] Thêm rewards khác (badges, points)
- [ ] Social sharing khi đạt milestone
- [ ] Notification nhắc nhở điểm danh
- [ ] Streak freeze (cho phép bỏ lỡ 1 ngày mà không mất streak)
- [ ] Voucher tích lũy (nhiều mốc khác nhau)

### Gamification
- [ ] Achievements system
- [ ] Daily challenges
- [ ] Seasonal events
- [ ] Friend referral rewards
