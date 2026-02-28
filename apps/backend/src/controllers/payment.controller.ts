import { Request, Response } from 'express';
import { createPaymentLink, verifyPaymentWebhook, getPaymentInfo } from '../services/payos.service.js';
import User from '../models/User.model.js';
import Subscription from '../models/Subscription.model.js';
import Voucher from '../models/Voucher.model.js';
import PendingPayment from '../models/PendingPayment.model.js';

// Create payment link
export const createPayment = async (req: Request, res: Response) => {
  try {
    const { planName, planPrice, duration, voucherCode } = req.body;
    const userId = (req as any).user?._id || (req as any).user?.id;

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

    // Create payment link with short description (max 25 chars)
    const shortDescription = `${planName.substring(0, 20)}`;
    const paymentLink = await createPaymentLink({
      orderCode,
      amount: finalPrice,
      description: shortDescription,
      buyerName: user.name,
      buyerEmail: user.email,
      returnUrl: process.env.PAYOS_RETURN_URL!,
      cancelUrl: process.env.PAYOS_CANCEL_URL!
    });

    // Save payment metadata to database (will auto-delete after 24 hours if not processed)
    await PendingPayment.create({
      orderCode: orderCode.toString(),
      userId,
      planName,
      planPrice: finalPrice,
      originalPrice: planPrice,
      duration,
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

// Test webhook endpoint
export const testWebhook = async (req: Request, res: Response) => {
  console.log('🧪 Test webhook called');
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  res.json({ success: true, message: 'Webhook endpoint is working!' });
};

// PayOS Webhook handler
export const handlePaymentWebhook = async (req: Request, res: Response) => {
  try {
    const webhookData = req.body;
    
    console.log('📥 Received webhook:', JSON.stringify(webhookData, null, 2));
    console.log('📥 Headers:', JSON.stringify(req.headers, null, 2));
    
    // Handle PayOS test webhook
    if (!webhookData || Object.keys(webhookData).length === 0) {
      console.log('✅ Test webhook received - responding with success');
      return res.json({ 
        success: true, 
        message: 'Webhook endpoint is working!',
        received: true 
      });
    }

    // Verify webhook signature
    let verifiedData;
    try {
      verifiedData = await verifyPaymentWebhook(webhookData);
    } catch (verifyError: any) {
      console.error('❌ Webhook verification failed:', verifyError.message);
      // Still respond with 200 to acknowledge receipt
      return res.json({ 
        success: false, 
        error: 'Verification failed',
        message: verifyError.message 
      });
    }

    // PayOS sends data in webhookData.data
    const paymentData = webhookData.data || verifiedData.data || webhookData;
    const paymentCode = paymentData.code || verifiedData.code;

    if (paymentCode === '00') {
      // Payment successful
      const orderCode = paymentData.orderCode;
      
      console.log(`✅ Payment verified for order ${orderCode}`);
      
      // Get payment metadata from database
      const pendingPayment = await PendingPayment.findOne({ orderCode: orderCode.toString() });
      
      if (!pendingPayment) {
        console.error(`❌ Payment metadata not found for order ${orderCode}`);
        // Still respond with 200 to acknowledge receipt
        return res.json({ 
          success: false, 
          error: 'Payment metadata not found',
          orderCode 
        });
      }

      console.log(`📦 Found pending payment:`, pendingPayment);

      // Create subscription now that payment is successful
      const subscription = await Subscription.create({
        userId: pendingPayment.userId,
        planName: pendingPayment.planName,
        planPrice: pendingPayment.planPrice,
        originalPrice: pendingPayment.originalPrice,
        duration: pendingPayment.duration,
        status: 'active',
        paymentMethod: 'PayOS',
        transactionId: orderCode.toString(),
        voucherCode: pendingPayment.voucherCode,
        voucherId: pendingPayment.voucherId,
        startDate: new Date(),
        endDate: new Date(Date.now() + pendingPayment.duration * 30 * 24 * 60 * 60 * 1000)
      });

      console.log(`💾 Created subscription:`, subscription);

      // Update user subscription
      await User.findByIdAndUpdate(pendingPayment.userId, {
        subscriptionPlan: pendingPayment.planName,
        subscriptionExpiry: subscription.endDate,
        subscriptionStatus: 'active'
      });

      console.log(`👤 Updated user subscription`);

      // Mark voucher as used if applicable
      if (pendingPayment.voucherId) {
        await Voucher.findByIdAndUpdate(pendingPayment.voucherId, {
          isUsed: true,
          usedAt: new Date()
        });
        console.log(`🎟️  Marked voucher as used`);
      }

      // Delete pending payment record
      await PendingPayment.findByIdAndDelete(pendingPayment._id);
      console.log(`🗑️  Deleted pending payment record`);

      console.log(`✅ Payment processing completed for order ${orderCode}`);
    } else {
      console.log(`⚠️  Payment not successful, code: ${verifiedData.code}`);
    }

    res.json({ success: true });
  } catch (error: any) {
    console.error('❌ Webhook error:', error);
    console.error('❌ Error stack:', error.stack);
    // Always respond with 200 to prevent PayOS from retrying
    res.json({ 
      success: false, 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
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
    const userId = (req as any).user?._id || (req as any).user?.id;

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
