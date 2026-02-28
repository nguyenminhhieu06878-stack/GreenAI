const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/.env' });

const MONGODB_URI = process.env.MONGODB_URI;

// Import models and services
async function testAccessAPI() {
  await mongoose.connect(MONGODB_URI);
  
  const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
  const Room = mongoose.model('Room', new mongoose.Schema({}, { strict: false }));
  
  // Find tenant
  const tenant = await User.findOne({ email: 'nguoithue101@gmail.com' });
  const tenantId = tenant._id.toString();
  
  console.log('Testing canAccessAnalytics for tenant:', tenant.email);
  console.log('Tenant ID:', tenantId);
  
  // Check if tenant is in a room
  const room = await Room.findOne({ tenantId: tenant._id }).populate('landlordId');
  
  if (!room) {
    console.log('Tenant is not in any room');
    process.exit(0);
  }
  
  console.log('\nRoom found:', room.name);
  console.log('Landlord:', room.landlordId.email);
  console.log('Landlord plan:', room.landlordId.subscriptionPlan);
  
  // Check landlord's plan limits
  const PLAN_LIMITS = {
    'Gói Professional': {
      analytics: true,
      aiEnabled: true,
      aiInsights: true
    }
  };
  
  const landlordPlan = room.landlordId.subscriptionPlan;
  const planLimits = PLAN_LIMITS[landlordPlan];
  
  console.log('\nPlan limits:', planLimits);
  console.log('Analytics allowed:', planLimits?.analytics);
  
  if (planLimits?.analytics) {
    console.log('\n✅ Tenant SHOULD have analytics access (inherited from landlord)');
  } else {
    console.log('\n❌ Tenant should NOT have analytics access');
  }
  
  process.exit(0);
}

testAccessAPI().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
