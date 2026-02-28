import mongoose from 'mongoose';

const PendingPaymentSchema = new mongoose.Schema({
  orderCode: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  planName: {
    type: String,
    required: true
  },
  planPrice: {
    type: Number,
    required: true
  },
  originalPrice: {
    type: Number,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  voucherCode: {
    type: String,
    default: null
  },
  voucherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Voucher',
    default: null
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    index: { expires: 0 } // TTL index - auto delete after expiresAt
  }
}, {
  timestamps: true
});

export default mongoose.model('PendingPayment', PendingPaymentSchema);
