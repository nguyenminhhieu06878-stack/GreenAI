const mongoose = require('mongoose');
const readline = require('readline');
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

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function manualCompletePayment() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/greenenergy');
    console.log('✅ Connected to MongoDB\n');

    // List all pending payments
    const pendingPayments = await PendingPayment.find().populate('userId');
    
    if (pendingPayments.length === 0) {
      console.log('❌ No pending payments found');
      process.exit(0);
    }

    console.log('📋 Pending Payments:\n');
    pendingPayments.forEach((payment, index) => {
      console.log(`${index + 1}. Order Code: ${payment.orderCode}`);
      console.log(`   User: ${payment.userId?.email || 'Unknown'}`);
      console.log(`   Plan: ${payment.planName} - ${payment.planPrice}đ`);
      console.log(`   Duration: ${payment.duration} months`);
      console.log(`   Created: ${payment.createdAt.toLocaleString()}\n`);
    });

    rl.question('Enter order code to complete payment (or "all" for all): ', async (answer) => {
      try {
        let paymentsToProcess = [];
        
        if (answer.toLowerCase() === 'all') {
          paymentsToProcess = pendingPayments;
        } else {
          const payment = pendingPayments.find(p => p.orderCode === answer);
          if (!payment) {
            console.log('❌ Order code not found');
            process.exit(1);
          }
          paymentsToProcess = [payment];
        }

        for (const pendingPayment of paymentsToProcess) {
          console.log(`\n🔄 Processing order ${pendingPayment.orderCode}...`);

          // Create subscription
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

          console.log(`✅ Created subscription: ${subscription._id}`);

          // Update user
          await User.findByIdAndUpdate(pendingPayment.userId, {
            subscriptionPlan: pendingPayment.planName,
            subscriptionExpiry: subscription.endDate,
            subscriptionStatus: 'active'
          });

          console.log(`✅ Updated user subscription`);

          // Mark voucher as used
          if (pendingPayment.voucherId) {
            await Voucher.findByIdAndUpdate(pendingPayment.voucherId, {
              isUsed: true,
              usedAt: new Date()
            });
            console.log(`✅ Marked voucher as used`);
          }

          // Delete pending payment
          await PendingPayment.findByIdAndDelete(pendingPayment._id);
          console.log(`✅ Deleted pending payment`);
        }

        console.log(`\n🎉 Successfully processed ${paymentsToProcess.length} payment(s)!`);
        process.exit(0);
      } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
      }
    });
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

manualCompletePayment();
