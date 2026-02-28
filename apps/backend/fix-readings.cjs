const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/.env' });

const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI)
  .then(async () => {
    const MeterReading = mongoose.model('MeterReading', new mongoose.Schema({}, { strict: false }));
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    const Room = mongoose.model('Room', new mongoose.Schema({}, { strict: false }));
    
    const testUser = await User.findOne({ email: 'test@gmail.com' });
    if (!testUser) {
      console.log('User not found');
      process.exit(0);
    }
    
    // Check if user is currently in any room
    const userRoom = await Room.findOne({ tenantId: testUser._id });
    
    if (userRoom) {
      console.log('User is currently in room:', userRoom.name);
      console.log('Cannot fix - user is still assigned to a room');
      process.exit(0);
    }
    
    // Remove roomId from all readings of this user
    const result = await MeterReading.updateMany(
      { userId: testUser._id, roomId: { $exists: true } },
      { $unset: { roomId: '' } }
    );
    
    console.log(`Fixed ${result.modifiedCount} readings for test@gmail.com`);
    console.log('These readings are now personal readings (no roomId)');
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });
