const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/.env' });

const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI)
  .then(async () => {
    const Room = mongoose.model('Room', new mongoose.Schema({}, { strict: false }));
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    
    const roomId = '69949d69ff55e22203a7cff5';
    const room = await Room.findById(roomId);
    
    if (!room) {
      console.log('Room not found');
      process.exit(0);
    }
    
    console.log('Room name:', room.name);
    console.log('Landlord ID:', room.landlordId);
    console.log('Tenant ID:', room.tenantId || 'null');
    
    if (room.tenantId) {
      const tenant = await User.findById(room.tenantId);
      console.log('Tenant email:', tenant?.email || 'N/A');
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });
