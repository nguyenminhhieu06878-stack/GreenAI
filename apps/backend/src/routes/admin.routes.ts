import { Router, Response } from 'express'
import {
  getAllUsers,
  getSystemStats,
  deleteUser,
  updateUserRole,
  getAllRooms,
  getTenantReadings,
  getAllVouchers,
  deleteVoucher
} from '../controllers/admin.controller'
import {
  getAllTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  getVoucherStats
} from '../controllers/voucherTemplate.controller'
import { adminCreateSubscription } from '../controllers/subscription.controller'
import { authenticate, AuthRequest } from '../middleware/auth'
import { requireAdmin } from '../middleware/adminAuth'

const router = Router()

router.use(authenticate, requireAdmin)

router.get('/stats', getSystemStats)
router.get('/users', getAllUsers)
router.delete('/users/:id', deleteUser)
router.put('/users/:id/role', updateUserRole)
router.get('/rooms', getAllRooms)
router.get('/tenants/:tenantId/readings', getTenantReadings)
router.get('/vouchers', getAllVouchers)
router.delete('/vouchers/:id', deleteVoucher)
router.get('/voucher-templates', getAllTemplates)
router.post('/voucher-templates', createTemplate)
router.put('/voucher-templates/:id', updateTemplate)
router.delete('/voucher-templates/:id', deleteTemplate)
router.get('/voucher-stats', getVoucherStats)
router.get('/readings', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id
    const { limit = 100 } = req.query
    
    // Get all rooms managed by this landlord
    const Room = (await import('../models/Room.model')).default
    const MeterReading = (await import('../models/MeterReading.model')).default
    
    const rooms = await Room.find({ landlordId: userId })
    const roomIds = rooms.map(r => r._id)
    
    // Get readings only from landlord's rooms
    const readings = await MeterReading.find({ roomId: { $in: roomIds } })
      .populate('userId', 'name email role')
      .populate('roomId', 'name')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
    
    res.json({ readings })
  } catch (error) {
    console.error('Get admin readings error:', error)
    res.status(500).json({ error: 'Failed to get readings' })
  }
})
router.post('/subscriptions/create', adminCreateSubscription)
router.put('/users/:userId/subscription', async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params
    const { subscriptionPlan, subscriptionExpiry } = req.body
    
    const User = (await import('../models/User.model')).default
    const user = await User.findById(userId)
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    
    // Update subscription
    if (subscriptionPlan !== undefined) {
      user.subscriptionPlan = subscriptionPlan
    }
    
    if (subscriptionExpiry !== undefined) {
      user.subscriptionExpiry = subscriptionExpiry ? new Date(subscriptionExpiry) : undefined
    }
    
    await user.save()
    
    res.json({ 
      message: 'Đã cập nhật subscription thành công',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        subscriptionPlan: user.subscriptionPlan,
        subscriptionExpiry: user.subscriptionExpiry
      }
    })
  } catch (error) {
    console.error('Update user subscription error:', error)
    res.status(500).json({ error: 'Failed to update subscription' })
  }
})
router.post('/recalculate-consumption', async (req: AuthRequest, res: Response) => {
  try {
    const MeterReading = (await import('../models/MeterReading.model')).default
    const { CalculationService } = await import('../services/calculation.service')
    
    // Get all readings sorted by date
    const allReadings = await MeterReading.find({}).sort({ createdAt: 1 })
    
    let updatedCount = 0
    
    // Group readings by roomId and userId
    const readingGroups: { [key: string]: any[] } = {}
    
    for (const reading of allReadings) {
      const key = reading.roomId ? `room_${reading.roomId}` : `user_${reading.userId}`
      if (!readingGroups[key]) {
        readingGroups[key] = []
      }
      readingGroups[key].push(reading)
    }
    
    // Recalculate consumption for each group
    for (const key in readingGroups) {
      const readings = readingGroups[key].sort((a, b) => 
        a.createdAt.getTime() - b.createdAt.getTime()
      )
      
      for (let i = 0; i < readings.length; i++) {
        const current = readings[i]
        
        if (i === 0) {
          // First reading has no previous, set consumption to 0
          current.consumption = 0
          current.cost = 0
        } else {
          // Calculate based on previous reading
          const previous = readings[i - 1]
          current.consumption = CalculationService.calculateConsumption(
            current.value,
            previous.value
          )
          current.cost = CalculationService.calculateCost(current.consumption)
        }
        
        await current.save()
        updatedCount++
      }
    }
    
    res.json({ 
      message: 'Đã tính lại tiêu thụ thành công',
      updatedCount 
    })
  } catch (error) {
    console.error('Recalculate consumption error:', error)
    res.status(500).json({ error: 'Failed to recalculate consumption' })
  }
})

export default router
