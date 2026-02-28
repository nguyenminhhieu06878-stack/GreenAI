const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/.env' });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/green-energy';
console.log('Connecting to:', MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@'));

mongoose.connect(MONGODB_URI)
  .then(async () => {
    const MeterReading = mongoose.model('MeterReading', new mongoose.Schema({}, { strict: false }));
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    
    const testUser = await User.findOne({ email: 'test@gmail.com' });
    if (!testUser) {
      console.log('User test@gmail.com not found');
      process.exit(0);
    }
    
    console.log('User ID:', testUser._id.toString());
    console.log('User role:', testUser.role);
    
    const readings = await MeterReading.find({ userId: testUser._id }).sort({ createdAt: -1 }).limit(10);
    console.log('\nReadings của test@gmail.com:');
    readings.forEach(r => {
      console.log('- Date:', new Date(r.createdAt).toLocaleDateString('vi-VN'), 
                  '| Value:', r.value, 
                  '| RoomId:', r.roomId ? r.roomId.toString() : 'null');
    });
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });
