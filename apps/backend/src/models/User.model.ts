import mongoose, { Schema, Document } from 'mongoose'

export interface IUser extends Document {
  email: string
  password: string
  name: string
  role: 'tenant' | 'landlord' | 'admin'
  googleId?: string
  isNewUser?: boolean
  subscriptionPlan: string
  subscriptionExpiry?: Date
  billingDate?: number
  monthlyGoal?: number
  electricityRate?: number
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: false // Not required for Google OAuth users
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    role: {
      type: String,
      enum: ['tenant', 'landlord', 'admin'],
      default: 'tenant'
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true // Allow null values
    },
    isNewUser: {
      type: Boolean,
      default: false
    },
    subscriptionPlan: {
      type: String,
      default: 'Gói Miễn Phí'
    },
    subscriptionExpiry: {
      type: Date
    },
    billingDate: {
      type: Number,
      min: 1,
      max: 31,
      default: 1
    },
    monthlyGoal: {
      type: Number,
      default: 0
    },
    electricityRate: {
      type: Number,
      default: 3000 // Default rate: 3000 VND per kWh
    }
  },
  {
    timestamps: true
  }
)

export default mongoose.model<IUser>('User', UserSchema)
