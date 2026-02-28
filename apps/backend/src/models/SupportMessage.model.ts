import mongoose, { Schema, Document } from 'mongoose'

export interface ISupportMessage extends Document {
  userId: mongoose.Types.ObjectId
  message: string
  isAdminReply: boolean
  adminId?: mongoose.Types.ObjectId
  status: 'open' | 'replied' | 'closed'
  createdAt: Date
  updatedAt: Date
}

const SupportMessageSchema = new Schema<ISupportMessage>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    message: {
      type: String,
      required: true
    },
    isAdminReply: {
      type: Boolean,
      default: false
    },
    adminId: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['open', 'replied', 'closed'],
      default: 'open'
    }
  },
  {
    timestamps: true
  }
)

export default mongoose.model<ISupportMessage>('SupportMessage', SupportMessageSchema)
