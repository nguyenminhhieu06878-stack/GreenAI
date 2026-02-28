const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  subscriptionPlan: String,
  subscriptionExpiry: Date,
  subscriptionStatus: String
}, { timestamps: true });

const subscriptionSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  planName: String,
  planPrice: Number,
  duration: Number,
  startDate: Date,
  endDate: Date,
  status: String,
  paymentMethod: String,
  transactionId: String
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Subscription = mongoose.model('Subscription', subscriptionSchema);

async function resetSubscriptions() {
  try {
    await mongoose.connect('mongodb+srv://quocbao:Hieunguyen1002@cluster0.segxwna.mongodb.net/greenenergy');
    console.log('✅ Connected to MongoDB');

    // Delete all subscriptions
    const deletedSubs = await Subscription.deleteMany({});
    console.log(`🗑️  Deleted ${deletedSubs.deletedCount} subscriptions`);

    // Reset all users to free plan
    const tenantUpdate = await User.updateMany(
      { role: 'tenant', role: { $ne: 'admin' } },
      {
        $set: {
          subscriptionPlan: 'Gói Miễn Phí',
          subscriptionExpiry: null,
          subscriptionStatus: 'active'
        }
      }
    );
    console.log(`👤 Reset ${tenantUpdate.modifiedCount} tenant accounts to free`);

    const landlordUpdate = await User.updateMany(
      { role: 'landlord' },
      {
        $set: {
          subscriptionPlan: 'Gói Miễn Phí (Chủ Trọ)',
          subscriptionExpiry: null,
          subscriptionStatus: 'active'
        }
      }
    );
    console.log(`🏠 Reset ${landlordUpdate.modifiedCount} landlord accounts to free`);

    console.log('\n✅ Reset completed successfully!');
    console.log('📊 Summary:');
    console.log(`   - Subscriptions deleted: ${deletedSubs.deletedCount}`);
    console.log(`   - Tenants reset: ${tenantUpdate.modifiedCount}`);
    console.log(`   - Landlords reset: ${landlordUpdate.modifiedCount}`);
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

resetSubscriptions();
