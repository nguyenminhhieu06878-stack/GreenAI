import mongoose, { Schema, Document } from 'mongoose'

export interface ISubscription extends Document {
  userId: mongoose.Types.ObjectId
  planName: string
  planPrice: number
  originalPrice?: number
  voucherCode?: string
  voucherId?: mongoose.Types.ObjectId
  duration: number // in months
  status: 'active' | 'expired' | 'cancelled' | 'pending'
  startDate: Date
  endDate: Date
  paymentMethod: string
  transactionId?: string
  createdAt: Date
  updatedAt: Date
}

const subscriptionSchema = new Schema<ISubscription>(
  {
    userId: {
      type: Schema.Types.ObjectId,
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
      type: Number
    },
    voucherCode: {
      type: String
    },
    voucherId: {
      type: Schema.Types.ObjectId,
      ref: 'Voucher'
    },
    duration: {
      type: Number,
      default: 1 // months
    },
    status: {
      type: String,
      enum: ['active', 'expired', 'cancelled', 'pending'],
      default: 'active'
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    paymentMethod: {
      type: String,
      required: true
    },
    transactionId: {
      type: String
    }
  },
  {
    timestamps: true
  }
)

export default mongoose.model<ISubscription>('Subscription', subscriptionSchema)
