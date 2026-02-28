const mongoose = require('mongoose');
require('dotenv').config();

const VoucherSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  code: { type: String, required: true, unique: true },
  discount: { type: Number, required: true },
  type: { type: String, enum: ['check-in', 'promotion', 'referral'], default: 'check-in' },
  isUsed: { type: Boolean, default: false },
  usedAt: { type: Date },
  expiresAt: { type: Date, required: true }
}, { timestamps: true });

const Voucher = mongoose.model('Voucher', VoucherSchema);

async function deleteAllVouchers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/energy-management');
    console.log('Connected to MongoDB');

    // Delete all vouchers
    const result = await Voucher.deleteMany({});

    console.log(`✅ Deleted ${result.deletedCount} vouchers`);
    console.log('All vouchers have been removed!');

    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

deleteAllVouchers();
