import mongoose, { Schema, Document } from 'mongoose'

export interface IVoucher extends Document {
  userId: mongoose.Types.ObjectId
  templateId?: mongoose.Types.ObjectId
  code: string
  value: string // e.g., "20%", "50%"
  discount: number // percentage number
  type: 'check-in' | 'promotion' | 'random'
  isUsed: boolean
  usedAt?: Date
  expiresAt: Date
  createdAt: Date
  updatedAt: Date
}

const VoucherSchema = new Schema<IVoucher>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    templateId: {
      type: Schema.Types.ObjectId,
      ref: 'VoucherTemplate'
    },
    code: {
      type: String,
      required: true,
      unique: true
    },
    value: {
      type: String,
      required: true
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    type: {
      type: String,
      enum: ['check-in', 'promotion', 'random'],
      default: 'check-in'
    },
    isUsed: {
      type: Boolean,
      default: false
    },
    usedAt: {
      type: Date
    },
    expiresAt: {
      type: Date,
      required: true
    }
  },
  {
    timestamps: true
  }
)

export default mongoose.model<IVoucher>('Voucher', VoucherSchema)
