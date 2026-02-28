const mongoose = require('mongoose');
require('dotenv').config();

const UserSchema = new mongoose.Schema({
  email: String,
  password: String,
  name: String,
  role: String,
  googleId: String,
  subscriptionPlan: String,
  subscriptionExpiry: Date,
  billingDate: Number,
  monthlyGoal: Number,
  electricityRate: Number,
  isNewUser: Boolean
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);

async function updateTenantPlans() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/greenenergy');
    console.log('✅ Connected to MongoDB');

    // Find all tenant users with "Gói Miễn Phí"
    const tenants = await User.find({ 
      role: 'tenant',
      subscriptionPlan: 'Gói Miễn Phí'
    });

    console.log(`📊 Found ${tenants.length} tenant users with "Gói Miễn Phí"`);

    if (tenants.length === 0) {
      console.log('✅ No tenants to update');
      process.exit(0);
    }

    // Update each tenant to "Gói Cơ Bản" with 60 days free
    for (const tenant of tenants) {
      tenant.subscriptionPlan = 'Gói Cơ Bản';
      tenant.subscriptionExpiry = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000); // 60 days
      await tenant.save();
      console.log(`✅ Updated ${tenant.email} to "Gói Cơ Bản" (expires: ${tenant.subscriptionExpiry.toLocaleDateString()})`);
    }

    console.log(`\n🎉 Successfully updated ${tenants.length} tenant users!`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

updateTenantPlans();
