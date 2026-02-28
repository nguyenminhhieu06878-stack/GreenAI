# Tính năng Kế thừa AI từ Chủ trọ

## Tổng quan
Người thuê (tenant) được gán vào phòng bởi chủ trọ sẽ tự động kế thừa quyền sử dụng AI từ gói dịch vụ của chủ trọ.

## Cách hoạt động

### Backend Logic (SubscriptionService.canUseAI)

1. **Kiểm tra vai trò người dùng**
   - Nếu là tenant → Tìm phòng mà tenant được gán vào

2. **Kiểm tra phòng**
   - Nếu tenant có phòng (tenantId trong Room model)
   - Lấy thông tin landlord của phòng đó

3. **Kiểm tra gói của landlord**
   - Nếu landlord có gói Starter trở lên (aiEnabled: true)
   - → Tenant được sử dụng AI miễn phí
   - Return: `{ allowed: true, source: 'landlord' }`

4. **Fallback**
   - Nếu không có phòng hoặc landlord không có AI
   - → Kiểm tra gói của chính tenant
   - Nếu tenant có gói Cơ Bản trở lên → Được dùng AI
   - Return: `{ allowed: true, source: 'own' }`

### Frontend Display

1. **AIChatbot Component**
   - Khi nhận response từ API, kiểm tra `aiAccessSource`
   - Nếu `aiAccessSource === 'landlord'` → Hiển thị thông báo:
     > 💡 Bạn đang sử dụng AI thông qua gói của chủ trọ

2. **AIInsights Component**
   - Hiển thị banner màu xanh ở đầu trang nếu AI từ landlord
   - Thông báo rõ ràng nguồn gốc quyền truy cập AI

## Các trường hợp sử dụng

### Trường hợp 1: Tenant có phòng, Landlord có AI
```
Tenant A → Room 101 → Landlord B (Gói Professional)
→ Tenant A được dùng AI miễn phí (kế thừa từ Landlord B)
```

### Trường hợp 2: Tenant có phòng, Landlord không có AI
```
Tenant A → Room 101 → Landlord B (Gói Miễn Phí)
→ Tenant A phải mua gói Cơ Bản để dùng AI
```

### Trường hợp 3: Tenant không có phòng
```
Tenant A → Không có phòng
→ Tenant A phải mua gói Cơ Bản để dùng AI
```

### Trường hợp 4: Landlord tự dùng
```
Landlord B (Gói Professional)
→ Landlord B dùng AI từ gói của mình
```

## Lợi ích

1. **Cho Tenant**
   - Được dùng AI miễn phí nếu chủ trọ có gói cao
   - Không cần mua gói riêng
   - Trải nghiệm tốt hơn

2. **Cho Landlord**
   - Tăng giá trị gói dịch vụ
   - Thu hút tenant sử dụng app
   - Quản lý tốt hơn

3. **Cho Business**
   - Khuyến khích landlord mua gói cao hơn
   - Tăng adoption rate
   - Network effect

## Files đã thay đổi

### Backend
- `apps/backend/src/services/subscription.service.ts`
  - Cập nhật `canUseAI()` method
  - Thêm logic kiểm tra room và landlord
  - Thêm `source` field trong response

- `apps/backend/src/controllers/ai.controller.ts`
  - Thêm `aiAccessSource` vào response của tất cả endpoints
  - `/api/ai/chat`, `/api/ai/analyze`, `/api/ai/anomalies`, `/api/ai/tips`

### Frontend
- `apps/frontend/src/components/AIChatbot.tsx`
  - Hiển thị thông báo khi AI từ landlord
  - Chỉ hiển thị 1 lần mỗi session

- `apps/frontend/src/components/AIInsights.tsx`
  - Thêm banner thông báo nguồn AI
  - Hiển thị ở đầu trang insights

## Testing

### Manual Test Steps

1. **Setup**
   ```
   - Tạo Landlord A với gói Professional
   - Tạo Tenant B với gói Miễn Phí
   - Tạo Room 101 thuộc Landlord A
   - Gán Tenant B vào Room 101
   ```

2. **Test AI Access**
   ```
   - Login as Tenant B
   - Mở AI Chatbot
   - Gửi tin nhắn
   - Kiểm tra: Có thông báo "thông qua gói của chủ trọ"
   ```

3. **Test Dashboard**
   ```
   - Vào Dashboard
   - Xem AI Insights
   - Kiểm tra: Có banner xanh thông báo nguồn AI
   ```

4. **Test Fallback**
   ```
   - Xóa tenant khỏi phòng (set tenantId = null)
   - Refresh page
   - Kiểm tra: AI bị chặn (403 error)
   ```

## API Response Format

```typescript
// Success with landlord AI
{
  response: "...",
  context: {...},
  aiAccessSource: "landlord"
}

// Success with own AI
{
  response: "...",
  context: {...},
  aiAccessSource: "own"
}

// Error - No AI access
{
  error: "Tính năng AI chỉ khả dụng từ gói Cơ Bản trở lên..."
}
```

## Database Schema

Không cần thay đổi schema. Sử dụng các field có sẵn:

- `Room.tenantId` - Link tenant to room
- `Room.landlordId` - Link room to landlord
- `User.subscriptionPlan` - Check plan limits

## Future Enhancements

1. **Analytics cho Landlord**
   - Thống kê số lượng tenant sử dụng AI
   - Hiển thị giá trị gói dịch vụ

2. **Giới hạn sử dụng**
   - Giới hạn số lượng request AI cho tenant
   - Quota system

3. **Notification**
   - Thông báo cho landlord khi tenant dùng AI
   - Email summary hàng tháng
