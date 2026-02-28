import mongoose, { Schema, Document } from 'mongoose'

export interface IVoucherTemplate extends Document {
  name: string
  description: string
  value: string // e.g., "10.000đ", "20%", "50.000đ"
  type: 'discount' | 'cashback' | 'gift'
  quantity: number // Total quantity available
  remaining: number // Remaining quantity
  probability: number // Probability weight for random selection (1-100)
  isActive: boolean
  validFrom?: Date
  validUntil?: Date
  createdAt: Date
  updatedAt: Date
}

const VoucherTemplateSchema = new Schema<IVoucherTemplate>(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    value: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['discount', 'cashback', 'gift'],
      default: 'discount'
    },
    quantity: {
      type: Number,
      required: true,
      min: 0
    },
    remaining: {
      type: Number,
      required: true,
      min: 0
    },
    probability: {
      type: Number,
      required: true,
      min: 1,
      max: 100,
      default: 10
    },
    isActive: {
      type: Boolean,
      default: true
    },
    validFrom: {
      type: Date
    },
    validUntil: {
      type: Date
    }
  },
  {
    timestamps: true
  }
)

// Index for active vouchers
VoucherTemplateSchema.index({ isActive: 1, remaining: 1 })

export default mongoose.model<IVoucherTemplate>('VoucherTemplate', VoucherTemplateSchema)
