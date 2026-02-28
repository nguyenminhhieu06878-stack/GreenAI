const mongoose = require('mongoose');

const meterReadingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
  reading: Number,
  previousReading: Number,
  consumption: Number,
  cost: Number,
  imageUrl: String,
  readingDate: Date,
  createdAt: Date,
  updatedAt: Date
}, { timestamps: true });

const MeterReading = mongoose.model('MeterReading', meterReadingSchema);
const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
const Room = mongoose.model('Room', new mongoose.Schema({}, { strict: false }));

async function seedMeterReadings() {
  try {
    await mongoose.connect('mongodb+srv://quocbao:Hieunguyen1002@cluster0.segxwna.mongodb.net/greenenergy');
    console.log('Connected to MongoDB');

    const room101 = await Room.findOne({ name: 'Phòng 101' });
    if (!room101) {
      console.log('❌ Phòng 101 not found!');
      await mongoose.disconnect();
      return;
    }

    console.log('✅ Found Phòng 101:', room101._id);

    console.log('Room tenantId:', room101.tenantId);
    
    let tenant = await User.findById(room101.tenantId);
    if (!tenant) {
      console.log('⚠️  Tenant not found by ID, finding any tenant...');
      tenant = await User.findOne({ role: 'tenant' });
      if (!tenant) {
        console.log('❌ No tenant user found!');
        await mongoose.disconnect();
        return;
      }
      // Update room with tenant
      room101.tenantId = tenant._id;
      await room101.save();
      console.log('✅ Updated room with tenant');
    }

    console.log('✅ Found tenant:', tenant.name, tenant.email);

    await MeterReading.deleteMany({ roomId: room101._id });
    console.log('🗑️  Cleared old readings');

    const readings = [];
    const today = new Date();
    const electricityRate = room101.electricityRate || 2500;

    let currentReading = 1000;
    
    for (let i = 90; i >= 0; i -= 5) {
      const readingDate = new Date(today);
      readingDate.setDate(readingDate.getDate() - i);
      
      const previousReading = currentReading;
      const consumption = Math.floor(Math.random() * 100) + 50;
      currentReading += consumption;
      
      const cost = consumption * electricityRate;

      readings.push({
        userId: tenant._id,
        roomId: room101._id,
        value: currentReading,
        reading: currentReading,
        previousReading: previousReading,
        consumption: consumption,
        cost: cost,
        readingDate: readingDate,
        createdAt: readingDate,
        updatedAt: readingDate
      });
    }

    await MeterReading.insertMany(readings);

    console.log(`✅ Created ${readings.length} meter readings for Phòng 101!`);
    console.log(`📊 Reading range: ${readings[0].reading} → ${readings[readings.length - 1].reading} kWh`);
    console.log(`💰 Total cost: ${readings.reduce((sum, r) => sum + r.cost, 0).toLocaleString('vi-VN')} đ`);
    
    await mongoose.disconnect();
    console.log('✅ Done!');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

seedMeterReadings();
