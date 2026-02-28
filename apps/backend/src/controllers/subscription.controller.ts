import { Response } from 'express'
import { AuthRequest } from '../middleware/auth'
import Subscription from '../models/Subscription.model'
import { SubscriptionService, PLAN_LIMITS } from '../services/subscription.service'
import User from '../models/User.model'

// Get all subscriptions (admin only)
export const getAllSubscriptions = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 50, status } = req.query

    const query: any = {}
    if (status) query.status = status

    const subscriptions = await Subscription.find(query)
      .populate('userId', 'name email role')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))

    const total = await Subscription.countDocuments(query)

    res.json({
      subscriptions,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit))
    })
  } catch (error) {
    console.error('Get all subscriptions error:', error)
    res.status(500).json({ error: 'Failed to get subscriptions' })
  }
}

// Get user's subscriptions
export const getUserSubscriptions = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id
    const subscriptions = await Subscription.find({ userId })
      .sort({ createdAt: -1 })

    // If no subscriptions in Subscription table, check User model for active plan
    if (subscriptions.length === 0) {
      const user = await User.findById(userId)
      
      if (user?.subscriptionPlan && user?.subscriptionExpiry) {
        const now = new Date()
        if (user.subscriptionExpiry > now) {
          // User has active subscription in User model (e.g., free trial)
          const planLimits = PLAN_LIMITS[user.subscriptionPlan as keyof typeof PLAN_LIMITS]
          
          // Create a virtual subscription object to display in UI
          const virtualSubscription = {
            _id: 'user-plan',
            userId: user._id,
            planName: user.subscriptionPlan,
            planPrice: planLimits?.price || 0,
            duration: 2, // 2 months free trial
            status: 'active',
            startDate: user.createdAt,
            endDate: user.subscriptionExpiry,
            paymentMethod: 'Miễn phí',
            transactionId: 'FREE-TRIAL',
            createdAt: user.createdAt
          }
          
          return res.json({ subscriptions: [virtualSubscription] })
        }
      }
    }

    res.json({ subscriptions })
  } catch (error) {
    console.error('Get user subscriptions error:', error)
    res.status(500).json({ error: 'Failed to get subscriptions' })
  }
}

// Create subscription
export const createSubscription = async (req: AuthRequest, res: Response) => {
  try {
    const { planName, planPrice, duration, paymentMethod, voucherCode } = req.body
    const userId = req.user?.id

    // Validate plan exists
    const planLimits = PLAN_LIMITS[planName as keyof typeof PLAN_LIMITS]
    if (!planLimits) {
      return res.status(400).json({ error: 'Invalid plan name' })
    }

    // Check if user role matches plan type
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    if (planLimits.type === 'landlord' && user.role !== 'landlord') {
      return res.status(400).json({ error: 'Gói này chỉ dành cho chủ trọ' })
    }

    if (planLimits.type === 'tenant' && user.role !== 'tenant') {
      return res.status(400).json({ error: 'Gói này chỉ dành cho người thuê' })
    }

    let finalPrice = planPrice
    let appliedVoucher = null

    // Apply voucher if provided
    if (voucherCode) {
      const Voucher = (await import('../models/Voucher.model')).default
      const voucher = await Voucher.findOne({
        code: voucherCode,
        userId,
        isUsed: false,
        expiresAt: { $gt: new Date() }
      })

      if (voucher) {
        // Apply discount
        const discount = voucher.discount
        finalPrice = Math.round(planPrice * (1 - discount / 100))
        
        // Mark voucher as used
        voucher.isUsed = true
        voucher.usedAt = new Date()
        await voucher.save()
        
        appliedVoucher = {
          code: voucher.code,
          discount: voucher.discount,
          savedAmount: planPrice - finalPrice
        }
      } else {
        return res.status(400).json({ error: 'Voucher không hợp lệ hoặc đã hết hạn' })
      }
    }

    // Deactivate old subscriptions
    await Subscription.updateMany(
      { userId, status: 'active' },
      { status: 'cancelled' }
    )

    const startDate = new Date()
    const endDate = new Date()
    endDate.setMonth(endDate.getMonth() + duration)

    const subscription = await Subscription.create({
      userId,
      planName,
      planPrice: finalPrice,
      duration,
      status: 'active',
      startDate,
      endDate,
      paymentMethod,
      transactionId: `TXN${Date.now()}`,
      voucherCode: appliedVoucher?.code
    })

    // Activate subscription for user
    await SubscriptionService.activateSubscription(userId!, planName, duration)

    res.status(201).json({ 
      subscription,
      appliedVoucher,
      message: appliedVoucher 
        ? `Đã áp dụng voucher ${appliedVoucher.discount}%! Tiết kiệm ${appliedVoucher.savedAmount.toLocaleString('vi-VN')}đ`
        : 'Đăng ký gói thành công!'
    })
  } catch (error) {
    console.error('Create subscription error:', error)
    res.status(500).json({ error: 'Failed to create subscription' })
  }
}

// Get user's current plan info
export const getCurrentPlan = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id
    const subscription = await SubscriptionService.getActiveSubscription(userId!)
    const planLimits = await SubscriptionService.getUserPlanLimits(userId!)

    res.json({
      subscription,
      planLimits,
      planName: subscription?.planName || 'Gói Miễn Phí'
    })
  } catch (error) {
    console.error('Get current plan error:', error)
    res.status(500).json({ error: 'Failed to get current plan' })
  }
}

// Admin: Create subscription for any user
export const adminCreateSubscription = async (req: AuthRequest, res: Response) => {
  try {
    const { userId, planName, planPrice, duration, paymentMethod } = req.body

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' })
    }

    // Validate plan exists
    const planLimits = PLAN_LIMITS[planName as keyof typeof PLAN_LIMITS]
    if (!planLimits) {
      return res.status(400).json({ error: 'Invalid plan name' })
    }

    // Check if user exists
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Check if user role matches plan type
    if (planLimits.type === 'landlord' && user.role !== 'landlord') {
      return res.status(400).json({ error: 'Gói này chỉ dành cho chủ trọ' })
    }

    if (planLimits.type === 'tenant' && user.role !== 'tenant') {
      return res.status(400).json({ error: 'Gói này chỉ dành cho người thuê' })
    }

    // Deactivate old subscriptions
    await Subscription.updateMany(
      { userId, status: 'active' },
      { status: 'cancelled' }
    )

    const startDate = new Date()
    const endDate = new Date()
    endDate.setMonth(endDate.getMonth() + duration)

    const subscription = await Subscription.create({
      userId,
      planName,
      planPrice,
      duration,
      status: 'active',
      startDate,
      endDate,
      paymentMethod,
      transactionId: `TXN${Date.now()}`
    })

    // Activate subscription for user
    await SubscriptionService.activateSubscription(userId, planName, duration)

    res.status(201).json({ subscription })
  } catch (error) {
    console.error('Admin create subscription error:', error)
    res.status(500).json({ error: 'Failed to create subscription' })
  }
}

// Get subscription access (includes inheritance from landlord)
export const getSubscriptionAccess = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id!
    
    const canAccessAnalytics = await SubscriptionService.canAccessAnalytics(userId)
    const canUseOCR = await SubscriptionService.canUseOCR(userId)
    const canUseAI = await SubscriptionService.canUseAI(userId)
    
    res.json({
      canAccessAnalytics: canAccessAnalytics.allowed,
      canUseOCR: canUseOCR.allowed,
      canUseAI: canUseAI.allowed
    })
  } catch (error) {
    console.error('Get subscription access error:', error)
    res.status(500).json({ error: 'Failed to get subscription access' })
  }
}

// Get room limit based on subscription
export const getRoomLimit = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id!
    const user = await User.findById(userId)
    const planLimits = await SubscriptionService.getUserPlanLimits(userId)
    
    res.json({
      limit: planLimits.maxRooms,
      planName: user?.subscriptionPlan || 'Gói Miễn Phí'
    })
  } catch (error) {
    console.error('Get room limit error:', error)
    res.status(500).json({ error: 'Failed to get room limit' })
  }
}
