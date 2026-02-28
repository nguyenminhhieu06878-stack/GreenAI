import express from 'express'
import cors from 'cors'
import passport from 'passport'
import authRoutes from './routes/auth.routes'
import meterRoutes from './routes/meter.routes'
import analyticsRoutes from './routes/analytics.routes'
import roomRoutes from './routes/room.routes'
import adminRoutes from './routes/admin.routes'
import subscriptionRoutes from './routes/subscription.routes'
import aiRoutes from './routes/ai.routes'
import supportRoutes from './routes/support.routes'
import checkinRoutes from './routes/checkin.routes'
import voucherRoutes from './routes/voucher.routes'
import paymentRoutes from './routes/payment.routes'
import { errorHandler } from './middleware/errorHandler'
import { config } from './config'
import { connectDatabase } from './config/database'
import { configurePassport } from './config/passport'

const app = express()

// Configure passport
configurePassport()

app.use(cors({ 
  origin: config.cors.origin,
  credentials: true 
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(passport.initialize())
app.use('/uploads', express.static(config.upload.dir))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/meter', meterRoutes)
app.use('/api/analytics', analyticsRoutes)
app.use('/api/rooms', roomRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/subscriptions', subscriptionRoutes)
app.use('/api/ai', aiRoutes)
app.use('/api/support', supportRoutes)
app.use('/api/checkin', checkinRoutes)
app.use('/api/vouchers', voucherRoutes)
app.use('/api/payment', paymentRoutes)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'GreenEnergy AI API is running' })
})

app.use(errorHandler)

// Connect to database
connectDatabase()

// Start server (for Railway, Render, etc.)
const PORT = config.port || process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`🚀 GreenEnergy AI Server running on port ${PORT}`)
  console.log(`📝 Environment: ${config.nodeEnv}`)
  console.log(`📁 Upload directory: ${config.upload.dir}`)
  console.log(`💬 Support chat using HTTP polling`)
})

// Export for serverless platforms
export default app
