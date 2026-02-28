const mongoose = require('mongoose');
require('dotenv').config();

const SubscriptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  planName: String,
  planPrice: Number,
  originalPrice: Number,
  duration: Number,
  status: String,
  paymentMethod: String,
  transactionId: String,
  voucherCode: String,
  voucherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Voucher' },
  startDate: Date,
  endDate: Date
}, { timestamps: true });

const Subscription = mongoose.model('Subscription', SubscriptionSchema);

async function deletePendingSubscriptions() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/greenenergy');
    console.log('✅ Connected to MongoDB');

    // Find all pending subscriptions
    const pendingSubscriptions = await Subscription.find({ status: 'pending' });
    console.log(`📊 Found ${pendingSubscriptions.length} pending subscriptions`);

    if (pendingSubscriptions.length === 0) {
      console.log('✅ No pending subscriptions to delete');
      process.exit(0);
    }

    // Delete all pending subscriptions
    const result = await Subscription.deleteMany({ status: 'pending' });
    console.log(`🗑️  Deleted ${result.deletedCount} pending subscriptions`);

    console.log('\n🎉 Successfully cleaned up pending subscriptions!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

deletePendingSubscriptions();
