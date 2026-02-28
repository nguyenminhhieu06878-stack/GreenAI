const mongoose = require('mongoose');

const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
const Room = mongoose.model('Room', new mongoose.Schema({}, { strict: false }));

async function assignTenant() {
  try {
    await mongoose.connect('mongodb+srv://quocbao:Hieunguyen1002@cluster0.segxwna.mongodb.net/greenenergy');
    console.log('Connected to MongoDB');

    // Find a tenant user (not landlord)
    const tenant = await User.findOne({ role: 'tenant' });
    if (!tenant) {
      console.log('❌ No tenant user found! Please register a tenant account first.');
      await mongoose.disconnect();
      return;
    }

    console.log('✅ Found tenant:', tenant.name, tenant.email);

    // Find Phòng 101
    const room = await Room.findOne({ name: 'Phòng 101' });
    if (!room) {
      console.log('❌ Phòng 101 not found!');
      await mongoose.disconnect();
      return;
    }

    console.log('✅ Found room:', room.name);

    // Assign tenant to room
    room.tenantId = tenant._id;
    room.status = 'occupied';
    await room.save();

    console.log('✅ Assigned', tenant.name, 'to', room.name);
    console.log('🏠 Room status:', room.status);
    
    await mongoose.disconnect();
    console.log('✅ Done!');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

assignTenant();
