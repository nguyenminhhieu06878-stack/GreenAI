const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/.env' });

const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI)
  .then(async () => {
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    const Room = mongoose.model('Room', new mongoose.Schema({}, { strict: false }));
    
    // Find tenant
    const tenant = await User.findOne({ email: 'nguoithue101@gmail.com' });
    if (!tenant) {
      console.log('Tenant not found');
      process.exit(0);
    }
    
    console.log('Tenant:', tenant.email);
    console.log('Tenant subscription:', tenant.subscriptionPlan);
    
    // Check if tenant is in a room
    const room = await Room.findOne({ tenantId: tenant._id });
    if (!room) {
      console.log('Tenant is not in any room');
      process.exit(0);
    }
    
    console.log('\nRoom:', room.name);
    console.log('Room ID:', room._id.toString());
    
    // Get landlord info
    const landlord = await User.findById(room.landlordId);
    console.log('\nLandlord:', landlord.email);
    console.log('Landlord subscription:', landlord.subscriptionPlan);
    console.log('Landlord subscription end:', landlord.subscriptionEndDate);
    
    // Check if landlord has premium
    const hasPremium = landlord.subscriptionPlan && landlord.subscriptionPlan !== 'Gói Miễn Phí';
    console.log('\nLandlord has premium:', hasPremium);
    console.log('Tenant should inherit:', hasPremium);
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });
