import mongoose, { Schema, Document } from 'mongoose'

export interface ICheckIn extends Document {
  userId: mongoose.Types.ObjectId
  checkInDate: Date
  streak: number
  totalCheckIns: number
  lastCheckIn: Date
  checkInHistory: Date[]
  createdAt: Date
  updatedAt: Date
}

const CheckInSchema = new Schema<ICheckIn>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    checkInDate: {
      type: Date,
      required: true
    },
    streak: {
      type: Number,
      default: 0
    },
    totalCheckIns: {
      type: Number,
      default: 0
    },
    lastCheckIn: {
      type: Date
    },
    checkInHistory: {
      type: [Date],
      default: []
    }
  },
  {
    timestamps: true
  }
)

export default mongoose.model<ICheckIn>('CheckIn', CheckInSchema)
