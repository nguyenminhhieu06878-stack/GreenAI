import mongoose from 'mongoose'
import { config } from './index'

export const connectDatabase = async () => {
  try {
    const mongoUri = config.database.uri
    
    await mongoose.connect(mongoUri)
    
    console.log('✅ MongoDB connected successfully')
    console.log(`📊 Database: ${mongoose.connection.name}`)
  } catch (error) {
    console.error('❌ MongoDB connection error:', error)
    process.exit(1)
  }
}

mongoose.connection.on('disconnected', () => {
  console.log('⚠️  MongoDB disconnected')
})

mongoose.connection.on('error', (error) => {
  console.error('❌ MongoDB error:', error)
})
