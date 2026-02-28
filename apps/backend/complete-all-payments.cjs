const mongoose = require('mongoose');
require('dotenv').config();

const PendingPaymentSchema = new mongoose.Schema({
  orderCode: String,
  userId: mongoose.Schema.Types.ObjectId,
  planName: String,
  planPrice: Number,
  originalPrice: Number,
  duration: Number,
  voucherCode: String,
  voucherId: mongoose.Schema.Types.ObjectId,
  expiresAt: Date
}, { timestamps: true });

const SubscriptionSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  planName: String,
  planPrice: Number,
  originalPrice: Number,
  duration: Number,
  status: String,
  paymentMethod: String,
  transactionId: String,
  voucherCode: String,
  voucherId: mongoose.Schema.Types.ObjectId,
  startDate: Date,
  endDate: Date
}, { timestamps: true });

const UserSchema = new mongoose.Schema({
  email: String,
  name: String,
  role: String,
  subscriptionPlan: String,
  subscriptionExpiry: Date,
  subscriptionStatus: String
}, { timestamps: true });

const VoucherSchema = new mongoose.Schema({
  code: String,
  isUsed: Boolean,
  usedAt: Date
}, { timestamps: true });

const PendingPayment = mongoose.model('PendingPayment', PendingPaymentSchema);
const Subscription = mongoose.model('Subscription', SubscriptionSchema);
const User = mongoose.model('User', UserSchema);
const Voucher = mongoose.model('Voucher', VoucherSchema);

async function completeAllPayments() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/greenenergy');
    console.log('✅ Connected to MongoDB\n');

    const pendingPayments = await PendingPayment.find().populate('userId');
    
    if (pendingPayments.length === 0) {
      console.log('❌ No pending payments found');
      await mongoose.connection.close();
      process.exit(0);
    }

    console.log(`📋 Found ${pendingPayments.length} pending payment(s)\n`);

    for (const pendingPayment of pendingPayments) {
      console.log(`🔄 Processing order ${pendingPayment.orderCode}...`);
      console.log(`   User: ${pendingPayment.userId?.email || 'Unknown'}`);
      console.log(`   Plan: ${pendingPayment.planName}`);

      const subscription = await Subscription.create({
        userId: pendingPayment.userId,
        planName: pendingPayment.planName,
        planPrice: pendingPayment.planPrice,
        originalPrice: pendingPayment.originalPrice,
        duration: pendingPayment.duration,
        status: 'active',
        paymentMethod: 'PayOS',
        transactionId: pendingPayment.orderCode,
        voucherCode: pendingPayment.voucherCode,
        voucherId: pendingPayment.voucherId,
        startDate: new Date(),
        endDate: new Date(Date.now() + pendingPayment.duration * 30 * 24 * 60 * 60 * 1000)
      });

      console.log(`   ✅ Created subscription`);

      await User.findByIdAndUpdate(pendingPayment.userId, {
        subscriptionPlan: pendingPayment.planName,
        subscriptionExpiry: subscription.endDate,
        subscriptionStatus: 'active'
      });

      console.log(`   ✅ Updated user subscription`);

      if (pendingPayment.voucherId) {
        await Voucher.findByIdAndUpdate(pendingPayment.voucherId, {
          isUsed: true,
          usedAt: new Date()
        });
        console.log(`   ✅ Marked voucher as used`);
      }

      await PendingPayment.findByIdAndDelete(pendingPayment._id);
      console.log(`   ✅ Deleted pending payment\n`);
    }

    console.log(`🎉 Successfully processed ${pendingPayments.length} payment(s)!`);
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

completeAllPayments();
