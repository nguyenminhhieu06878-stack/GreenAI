const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/.env' });

const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI)
  .then(async () => {
    const MeterReading = mongoose.model('MeterReading', new mongoose.Schema({}, { strict: false }));
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    
    // Find landlord
    const landlord = await User.findOne({ role: 'landlord' });
    if (!landlord) {
      console.log('No landlord found');
      process.exit(0);
    }
    
    console.log('Landlord:', landlord.email);
    console.log('Landlord ID:', landlord._id.toString());
    
    // Get readings that landlord would see (by userId)
    const readings = await MeterReading.find({ userId: landlord._id })
      .sort({ createdAt: -1 })
      .limit(10);
    
    console.log(`\nReadings with landlord's userId (${readings.length}):`);
    for (const r of readings) {
      const user = await User.findById(r.userId);
      console.log(`- Date: ${new Date(r.createdAt).toLocaleDateString('vi-VN')} | Value: ${r.value} | User: ${user?.email} | RoomId: ${r.roomId || 'null'}`);
    }
    
    // Check if there are readings from other users
    const allReadings = await MeterReading.find({}).sort({ createdAt: -1 }).limit(20);
    console.log(`\nAll recent readings (${allReadings.length}):`);
    for (const r of allReadings) {
      const user = await User.findById(r.userId);
      console.log(`- Date: ${new Date(r.createdAt).toLocaleDateString('vi-VN')} | Value: ${r.value} | User: ${user?.email} (${user?.role}) | RoomId: ${r.roomId || 'null'}`);
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });
