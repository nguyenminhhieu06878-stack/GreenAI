import mongoose, { Schema, Document } from 'mongoose'

export interface IRoom extends Document {
  landlordId: mongoose.Types.ObjectId
  tenantId?: mongoose.Types.ObjectId
  name: string
  address?: string
  electricityRate?: number
  status: 'active' | 'inactive'
  createdAt: Date
  updatedAt: Date
}

const RoomSchema = new Schema<IRoom>(
  {
    landlordId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    address: {
      type: String,
      trim: true
    },
    electricityRate: {
      type: Number,
      default: 2500
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active'
    }
  },
  {
    timestamps: true
  }
)

RoomSchema.index({ landlordId: 1 })
RoomSchema.index({ tenantId: 1 })

export default mongoose.model<IRoom>('Room', RoomSchema)
