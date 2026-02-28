import mongoose, { Schema, Document } from 'mongoose'

export interface IMeterReading extends Document {
  userId: mongoose.Types.ObjectId
  roomId?: mongoose.Types.ObjectId
  value: number
  consumption?: number
  cost?: number
  imagePath?: string
  method: 'auto' | 'manual'
  confidence?: number
  notes?: string
  createdAt: Date
  updatedAt: Date
}

const MeterReadingSchema = new Schema<IMeterReading>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    roomId: {
      type: Schema.Types.ObjectId,
      ref: 'Room'
    },
    value: {
      type: Number,
      required: true,
      min: 0
    },
    consumption: {
      type: Number,
      default: 0,
      min: 0
    },
    cost: {
      type: Number,
      default: 0,
      min: 0
    },
    imagePath: {
      type: String
    },
    method: {
      type: String,
      enum: ['auto', 'manual'],
      required: true
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1
    },
    notes: {
      type: String
    }
  },
  {
    timestamps: true
  }
)

MeterReadingSchema.index({ userId: 1, createdAt: -1 })
MeterReadingSchema.index({ roomId: 1, createdAt: -1 })

export default mongoose.model<IMeterReading>('MeterReading', MeterReadingSchema)
