# PayOS Integration Guide

## Overview
Tích hợp cổng thanh toán PayOS vào GreenEnergy AI để người dùng có thể mua gói dịch vụ trực tuyến với hỗ trợ mã giảm giá từ check-in game.

## ✅ COMPLETED - PayOS Integration Status

### Backend Implementation ✅
- ✅ PayOS SDK installed (`@payos/node`)
- ✅ PayOS service created (`apps/backend/src/services/payos.service.ts`)
- ✅ Payment controller created (`apps/backend/src/controllers/payment.controller.ts`)
- ✅ Payment routes created (`apps/backend/src/routes/payment.routes.ts`)
- ✅ Subscription model updated with new fields (originalPrice, voucherCode, voucherId, status: 'pending')
- ✅ Payment routes registered in main index.ts
- ✅ Environment variables added to .env and .env.example

### Frontend Implementation ✅
- ✅ Pricing page updated with PayOS integration
- ✅ Voucher validation integrated with payment flow
- ✅ PaymentSuccess page created
- ✅ PaymentFailure page created
- ✅ Routes added to App.tsx

### Database Reset ✅
- ✅ All subscriptions deleted (55 subscriptions)
- ✅ All users reset to free plans (15 tenants, 3 landlords)

## PayOS Credentials
```
Client ID: e9efe4f8-13d6-48de-8f7d-4000b8cd1605
API Key: 0d8df1f3e31c77a81653a0504239b48bc08e309b364a56a643610b3742b5997d
Checksum Key: [CẦN BỔ SUNG - Lấy từ PayOS Dashboard]
```

## ⚠️ IMPORTANT - Next Steps

### 1. Get Checksum Key
Bạn cần lấy Checksum Key từ PayOS Dashboard và cập nhật vào file `.env`:
```env
PAYOS_CHECKSUM_KEY=your_actual_checksum_key_here
```

### 2. Test Payment Flow
```bash
# Start backend
cd apps/backend
npm run dev

# Start frontend (in another terminal)
cd apps/frontend
npm run dev
```

### 3. Testing Steps
1. Đăng nhập vào hệ thống
2. Vào trang "Bảng Giá" (/bang-gia)
3. Chọn một gói trả phí
4. (Tùy chọn) Nhập mã voucher từ check-in game
5. Click "Xác Nhận"
6. Hệ thống sẽ chuyển đến trang thanh toán PayOS
7. Hoàn tất thanh toán
8. Được redirect về trang thành công
9. Kiểm tra gói đã được kích hoạt

### 4. Configure Webhook (Production)
Khi deploy lên production, cần cấu hình webhook URL trong PayOS Dashboard:
```
https://yourdomain.com/api/payment/webhook
```

Cho local testing, dùng ngrok:
```bash
ngrok http 3000
# Sử dụng URL: https://xxx.ngrok.io/api/payment/webhook
```

## Backend Implementation

### 1. Create PayOS Service

File: `apps/backend/src/services/payos.service.ts`

```typescript
import PayOS from '@payos/node';

const payOS = new PayOS(
  process.env.PAYOS_CLIENT_ID!,
  process.env.PAYOS_API_KEY!,
  process.env.PAYOS_CHECKSUM_KEY!
);

export interface CreatePaymentData {
  orderCode: number;
  amount: number;
  description: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone?: string;
  returnUrl: string;
  cancelUrl: string;
}

export const createPaymentLink = async (data: CreatePaymentData) => {
  try {
    const paymentLinkResponse = await payOS.createPaymentLink({
      orderCode: data.orderCode,
      amount: data.amount,
      description: data.description,
      buyerName: data.buyerName,
      buyerEmail: data.buyerEmail,
      buyerPhone: data.buyerPhone,
      returnUrl: data.returnUrl,
      cancelUrl: data.cancelUrl,
      items: [{
        name: data.description,
        quantity: 1,
        price: data.amount
      }]
    });

    return paymentLinkResponse;
  } catch (error) {
    console.error('PayOS Error:', error);
    throw error;
  }
};

export const verifyPaymentWebhook = async (webhookData: any) => {
  try {
    const verifiedData = payOS.verifyPaymentWebhookData(webhookData);
    return verifiedData;
  } catch (error) {
    console.error('Webhook verification failed:', error);
    throw error;
  }
};

export const getPaymentInfo = async (orderCode: number) => {
  try {
    const paymentInfo = await payOS.getPaymentLinkInformation(orderCode);
    return paymentInfo;
  } catch (error) {
    console.error('Get payment info error:', error);
    throw error;
  }
};
```

### 2. Create Payment Controller

File: `apps/backend/src/controllers/payment.controller.ts`

```typescript
import { Request, Response } from 'express';
import { createPaymentLink, verifyPaymentWebhook, getPaymentInfo } from '../services/payos.service';
import User from '../models/User.model';
import Subscription from '../models/Subscription.model';
import Voucher from '../models/Voucher.model';

// Create payment link
export const createPayment = async (req: Request, res: Response) => {
  try {
    const { planName, planPrice, duration, voucherCode } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let finalPrice = planPrice;
    let appliedVoucher = null;

    // Apply voucher if provided
    if (voucherCode) {
      const voucher = await Voucher.findOne({
        code: voucherCode,
        userId: userId,
        isUsed: false,
        expiresAt: { $gt: new Date() }
      });

      if (voucher) {
        const discount = voucher.discount || parseInt(voucher.value) || 0;
        finalPrice = Math.round(planPrice * (1 - discount / 100));
        appliedVoucher = voucher;
      }
    }

    // Generate unique order code
    const orderCode = Date.now();

    // Create payment link
    const paymentLink = await createPaymentLink({
      orderCode,
      amount: finalPrice,
      description: `Thanh toán ${planName} - ${user.name}`,
      buyerName: user.name,
      buyerEmail: user.email,
      returnUrl: process.env.PAYOS_RETURN_URL!,
      cancelUrl: process.env.PAYOS_CANCEL_URL!
    });

    // Save pending subscription
    const subscription = await Subscription.create({
      userId,
      planName,
      planPrice: finalPrice,
      originalPrice: planPrice,
      duration,
      status: 'pending',
      paymentMethod: 'PayOS',
      transactionId: orderCode.toString(),
      voucherCode: voucherCode || null,
      voucherId: appliedVoucher?._id || null
    });

    res.json({
      success: true,
      paymentUrl: paymentLink.checkoutUrl,
      orderCode,
      amount: finalPrice,
      originalPrice: planPrice,
      discount: planPrice - finalPrice
    });
  } catch (error: any) {
    console.error('Create payment error:', error);
    res.status(500).json({ error: error.message || 'Failed to create payment' });
  }
};

// PayOS Webhook handler
export const handlePaymentWebhook = async (req: Request, res: Response) => {
  try {
    const webhookData = req.body;
    
    // Verify webhook signature
    const verifiedData = await verifyPaymentWebhook(webhookData);

    if (verifiedData.code === '00') {
      // Payment successful
      const orderCode = verifiedData.data.orderCode;
      
      // Find pending subscription
      const subscription = await Subscription.findOne({
        transactionId: orderCode.toString(),
        status: 'pending'
      });

      if (subscription) {
        // Update subscription status
        subscription.status = 'active';
        subscription.startDate = new Date();
        subscription.endDate = new Date(Date.now() + subscription.duration * 30 * 24 * 60 * 60 * 1000);
        await subscription.save();

        // Update user subscription
        await User.findByIdAndUpdate(subscription.userId, {
          subscriptionPlan: subscription.planName,
          subscriptionExpiry: subscription.endDate,
          subscriptionStatus: 'active'
        });

        // Mark voucher as used if applicable
        if (subscription.voucherId) {
          await Voucher.findByIdAndUpdate(subscription.voucherId, {
            isUsed: true,
            usedAt: new Date()
          });
        }

        console.log(`✅ Payment successful for order ${orderCode}`);
      }
    }

    res.json({ success: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Check payment status
export const checkPaymentStatus = async (req: Request, res: Response) => {
  try {
    const { orderCode } = req.params;
    
    const paymentInfo = await getPaymentInfo(parseInt(orderCode));
    
    res.json({
      success: true,
      status: paymentInfo.status,
      data: paymentInfo
    });
  } catch (error: any) {
    console.error('Check payment error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Validate voucher
export const validateVoucher = async (req: Request, res: Response) => {
  try {
    const { voucherCode } = req.body;
    const userId = req.user?.id;

    const voucher = await Voucher.findOne({
      code: voucherCode,
      userId: userId,
      isUsed: false,
      expiresAt: { $gt: new Date() }
    });

    if (!voucher) {
      return res.status(404).json({ 
        valid: false, 
        error: 'Mã giảm giá không hợp lệ hoặc đã hết hạn' 
      });
    }

    const discount = voucher.discount || parseInt(voucher.value) || 0;

    res.json({
      valid: true,
      discount,
      code: voucher.code,
      expiresAt: voucher.expiresAt
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
```

### 3. Create Payment Routes

File: `apps/backend/src/routes/payment.routes.ts`

```typescript
import express from 'express';
import { auth } from '../middleware/auth';
import {
  createPayment,
  handlePaymentWebhook,
  checkPaymentStatus,
  validateVoucher
} from '../controllers/payment.controller';

const router = express.Router();

router.post('/create', auth, createPayment);
router.post('/webhook', handlePaymentWebhook); // No auth - PayOS calls this
router.get('/status/:orderCode', auth, checkPaymentStatus);
router.post('/validate-voucher', auth, validateVoucher);

export default router;
```

### 4. Update Subscription Model

Add fields to `apps/backend/src/models/Subscription.model.ts`:

```typescript
originalPrice: Number,
voucherCode: String,
voucherId: mongoose.Schema.Types.ObjectId
```

### 5. Register Routes

In `apps/backend/src/index.ts`:

```typescript
import paymentRoutes from './routes/payment.routes';

app.use('/api/payment', paymentRoutes);
```

## Frontend Implementation

### 1. Update Pricing Page

Add voucher input and PayOS integration to `apps/frontend/src/pages/Pricing.tsx`

### 2. Create Payment Success/Failure Pages

- `apps/frontend/src/pages/PaymentSuccess.tsx`
- `apps/frontend/src/pages/PaymentFailure.tsx`

### 3. Add Routes

In `apps/frontend/src/App.tsx`:

```typescript
import PaymentSuccess from './pages/PaymentSuccess'
import PaymentFailure from './pages/PaymentFailure'

// Add routes
<Route path="thanh-toan/thanh-cong" element={<PaymentSuccess />} />
<Route path="thanh-toan/that-bai" element={<PaymentFailure />} />
```

## Testing

1. Reset database: `node reset-subscriptions.cjs`
2. Start backend: `npm run dev`
3. Start frontend: `npm run dev`
4. Go to Pricing page
5. Select a plan
6. Enter voucher code (optional)
7. Click "Mua Ngay"
8. Complete payment on PayOS
9. Verify subscription activated

## Webhook Configuration

Configure webhook URL in PayOS dashboard:
```
https://yourdomain.com/api/payment/webhook
```

For local testing, use ngrok:
```bash
ngrok http 3000
# Use ngrok URL: https://xxx.ngrok.io/api/payment/webhook
```

## Security Notes

1. Never expose API keys in frontend
2. Always verify webhook signatures
3. Use HTTPS in production
4. Validate all payment amounts server-side
5. Log all transactions for audit

## Next Steps

1. Get checksum key from PayOS
2. Implement frontend UI
3. Test payment flow
4. Configure webhook
5. Deploy to production
