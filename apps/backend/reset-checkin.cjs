const mongoose = require('mongoose');
require('dotenv').config();

const CheckInSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  checkInDate: { type: Date, required: true },
  streak: { type: Number, default: 0 },
  totalCheckIns: { type: Number, default: 0 },
  lastCheckIn: { type: Date },
  checkInHistory: [{ type: Date }]
}, { timestamps: true });

const CheckIn = mongoose.model('CheckIn', CheckInSchema);

async function resetCheckIns() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/energy-management');
    console.log('Connected to MongoDB');

    // Reset all check-ins to 0
    const result = await CheckIn.updateMany(
      {},
      {
        $set: {
          streak: 0,
          checkInHistory: [],
          lastCheckIn: null
        }
      }
    );

    console.log(`✅ Reset ${result.modifiedCount} check-in records`);
    console.log('All users can now start fresh from day 1!');

    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

resetCheckIns();
