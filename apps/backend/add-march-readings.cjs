const mongoose = require('mongoose');

const meterReadingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
  reading: Number,
  value: Number,
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

async function addMarchReadings() {
  try {
    await mongoose.connect('mongodb+srv://quocbao:Hieunguyen1002@cluster0.segxwna.mongodb.net/greenenergy');
    console.log('Connected to MongoDB');

    const room = await Room.findOne({ name: 'Phòng 101' });
    if (!room) {
      console.log('❌ Phòng 101 not found!');
      await mongoose.disconnect();
      return;
    }

    const tenant = await User.findOne({ role: 'tenant' });
    if (!tenant) {
      console.log('❌ No tenant found!');
      await mongoose.disconnect();
      return;
    }

    console.log('✅ Found room:', room.name);
    console.log('✅ Found tenant:', tenant.name);

    const lastReading = await MeterReading.findOne({ roomId: room._id }).sort({ createdAt: -1 });
    let currentValue = lastReading ? lastReading.value : 1500;
    
    console.log('📊 Last reading value:', currentValue);

    const electricityRate = room.electricityRate || 2500;
    const readings = [];

    const marchDates = [
      new Date('2026-03-05'),
      new Date('2026-03-08'),
      new Date('2026-03-12'),
      new Date('2026-03-15'),
      new Date('2026-03-18'),
      new Date('2026-03-22'),
      new Date('2026-03-25'),
      new Date('2026-03-28'),
      new Date('2026-03-31')
    ];

    for (const date of marchDates) {
      const previousValue = currentValue;
      const consumption = Math.floor(Math.random() * 30) + 20;
      currentValue += consumption;
      const cost = consumption * electricityRate;

      readings.push({
        userId: tenant._id,
        roomId: room._id,
        value: currentValue,
        reading: currentValue,
        previousReading: previousValue,
        consumption: consumption,
        cost: cost,
        readingDate: date,
        createdAt: date,
        updatedAt: date
      });
    }

    await MeterReading.insertMany(readings);

    console.log(`✅ Added ${readings.length} readings for March 2026!`);
    console.log(`📊 Value range: ${readings[0].value} → ${readings[readings.length - 1].value} kWh`);
    console.log(`💰 Total cost: ${readings.reduce((sum, r) => sum + r.cost, 0).toLocaleString('vi-VN')} đ`);
    
    await mongoose.disconnect();
    console.log('✅ Done!');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

addMarchReadings();
