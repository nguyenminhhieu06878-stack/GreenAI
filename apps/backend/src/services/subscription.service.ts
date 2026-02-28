import Subscription from '../models/Subscription.model'
import User from '../models/User.model'
import Room from '../models/Room.model'

// Define plan limits
export const PLAN_LIMITS = {
  // Tenant plans
  'Gói Miễn Phí': {
    type: 'tenant',
    maxRooms: 1,
    historyMonths: 3,
    ocrEnabled: false,
    pdfExport: false,
    analytics: false,
    aiEnabled: false,
    aiInsights: false,
    support: false,
    price: 0
  },
  'Gói Cơ Bản': {
    type: 'tenant',
    maxRooms: 1,
    historyMonths: null, // unlimited
    ocrEnabled: true,
    pdfExport: true,  // PDF export enabled for Gói Cơ Bản
    analytics: true,
    aiEnabled: true,
    aiInsights: true,
    support: false,
    price: 29000
  },
  // Landlord plans
  'Gói Miễn Phí (Chủ Trọ)': {
    type: 'landlord',
    maxRooms: 2,
    historyMonths: 3,
    ocrEnabled: false,
    pdfExport: false,
    analytics: false,
    aiEnabled: false,
    aiInsights: false,
    support: false,
    price: 0
  },
  'Gói Starter': {
    type: 'landlord',
    maxRooms: 5,
    historyMonths: null,
    ocrEnabled: true,
    pdfExport: false,
    analytics: false,  // Analytics disabled for Starter
    aiEnabled: true,   // AI Chatbot enabled
    aiInsights: false, // AI Insights (analysis + anomaly detection) disabled
    support: false,
    price: 99000
  },
  'Gói Professional': {
    type: 'landlord',
    maxRooms: 20,
    historyMonths: null,
    ocrEnabled: true,
    pdfExport: false,
    analytics: true,  // Analytics enabled from Professional
    aiEnabled: true,
    aiInsights: true, // AI Insights enabled from Professional
    support: false,
    price: 199000
  },
  'Gói Business': {
    type: 'landlord',
    maxRooms: null, // unlimited
    historyMonths: null,
    ocrEnabled: true,
    pdfExport: true,  // PDF export enabled for Business plan
    analytics: true,
    aiEnabled: true,
    aiInsights: true,
    support: true,    // Support chat enabled for Business plan
    price: 299000
  },
  // Legacy plans (for backward compatibility)
  'Gói Cơ Bản (Cũ)': {
    type: 'landlord',
    maxRooms: 3,
    historyMonths: null,
    ocrEnabled: false,
    pdfExport: false,
    analytics: true,
    aiEnabled: false,
    aiInsights: false,
    support: false,
    price: 99000
  },
  'Gói Chuyên Nghiệp': {
    type: 'landlord',
    maxRooms: 12,
    historyMonths: null,
    ocrEnabled: true,
    pdfExport: false,
    analytics: true,
    aiEnabled: false,
    aiInsights: false,
    support: false,
    price: 199000
  },
  'Gói Doanh Nghiệp': {
    type: 'landlord',
    maxRooms: null,
    historyMonths: null,
    ocrEnabled: true,
    pdfExport: false,
    analytics: true,
    aiEnabled: false,
    aiInsights: false,
    support: false,
    price: 499000
  }
}

export class SubscriptionService {
  // Get active subscription for user
  static async getActiveSubscription(userId: string) {
    const subscription = await Subscription.findOne({
      userId,
      status: 'active',
      endDate: { $gt: new Date() }
    }).sort({ createdAt: -1 })

    return subscription
  }

  // Get plan limits for user
  static async getUserPlanLimits(userId: string) {
    const user = await User.findById(userId)
    
    // First check if user has an active plan in User model (for new registrations)
    if (user?.subscriptionPlan && user?.subscriptionExpiry) {
      const now = new Date()
      if (user.subscriptionExpiry > now) {
        // User has active subscription in User model
        const planLimits = PLAN_LIMITS[user.subscriptionPlan as keyof typeof PLAN_LIMITS]
        if (planLimits) {
          return planLimits
        }
      }
    }
    
    // Then check Subscription table (for purchased subscriptions)
    const subscription = await this.getActiveSubscription(userId)
    
    if (!subscription) {
      // Return free plan limits based on user role
      if (user?.role === 'landlord') {
        return PLAN_LIMITS['Gói Miễn Phí (Chủ Trọ)']
      }
      return PLAN_LIMITS['Gói Miễn Phí']
    }

    const planLimits = PLAN_LIMITS[subscription.planName as keyof typeof PLAN_LIMITS]
    
    if (!planLimits) {
      // Fallback to free plan if plan not found
      if (user?.role === 'landlord') {
        return PLAN_LIMITS['Gói Miễn Phí (Chủ Trọ)']
      }
      return PLAN_LIMITS['Gói Miễn Phí']
    }

    return planLimits
  }

  // Check if user can create more rooms
  static async canCreateRoom(userId: string): Promise<{ allowed: boolean; message?: string; currentCount?: number; maxRooms?: number | null }> {
    const user = await User.findById(userId)
    
    if (user?.role !== 'landlord') {
      return { allowed: false, message: 'Only landlords can create rooms' }
    }

    const planLimits = await this.getUserPlanLimits(userId)
    const currentRoomCount = await Room.countDocuments({ landlordId: userId })

    if (planLimits.maxRooms === null) {
      // Unlimited rooms
      return { allowed: true, currentCount: currentRoomCount, maxRooms: null }
    }

    if (currentRoomCount >= planLimits.maxRooms) {
      return {
        allowed: false,
        message: `Bạn đã đạt giới hạn ${planLimits.maxRooms} phòng. Vui lòng nâng cấp gói để tạo thêm phòng.`,
        currentCount: currentRoomCount,
        maxRooms: planLimits.maxRooms
      }
    }

    return { allowed: true, currentCount: currentRoomCount, maxRooms: planLimits.maxRooms }
  }

  // Check if user can use OCR
  static async canUseOCR(userId: string): Promise<{ allowed: boolean; message?: string }> {
    // First check if user is a tenant in any room
    const user = await User.findById(userId)
    if (!user) {
      return { allowed: false, message: 'User not found' }
    }

    if (user.role === 'tenant') {
      // Check if tenant is assigned to a room
      const room = await Room.findOne({ tenantId: userId }).populate('landlordId')
      
      if (room && room.landlordId) {
        // Tenant has a room, check landlord's subscription
        const landlordId = (room.landlordId as any)._id.toString()
        const landlordPlanLimits = await this.getUserPlanLimits(landlordId)
        
        if (landlordPlanLimits.ocrEnabled) {
          return { allowed: true }
        }
      }
    }

    // Check user's own subscription
    const planLimits = await this.getUserPlanLimits(userId)

    if (!planLimits.ocrEnabled) {
      return {
        allowed: false,
        message: 'Tính năng OCR chỉ khả dụng từ gói Cơ Bản trở lên. Vui lòng nâng cấp gói.'
      }
    }

    return { allowed: true }
  }

  // Check if user can export PDF
  static async canExportPDF(userId: string): Promise<{ allowed: boolean; message?: string }> {
    const planLimits = await this.getUserPlanLimits(userId)

    if (!planLimits.pdfExport) {
      return {
        allowed: false,
        message: 'Tính năng xuất PDF chỉ khả dụng từ gói Cao Cấp trở lên. Vui lòng nâng cấp gói.'
      }
    }

    return { allowed: true }
  }

  // Check if user can access analytics
  static async canAccessAnalytics(userId: string): Promise<{ allowed: boolean; message?: string; source?: string }> {
    // First check if user is a tenant in any room
    const user = await User.findById(userId)
    if (!user) {
      return { allowed: false, message: 'User not found' }
    }

    if (user.role === 'tenant') {
      // Check if tenant is assigned to a room
      const room = await Room.findOne({ tenantId: userId }).populate('landlordId')
      
      if (room && room.landlordId) {
        // Tenant has a room, check landlord's subscription
        const landlordId = (room.landlordId as any)._id.toString()
        const landlordPlanLimits = await this.getUserPlanLimits(landlordId)
        
        if (landlordPlanLimits.analytics) {
          return { 
            allowed: true,
            source: 'landlord',
            message: `Kế thừa từ gói ${(room.landlordId as any).subscriptionPlan || 'của chủ trọ'}`
          }
        }
      }
    }

    // Check user's own subscription
    const planLimits = await this.getUserPlanLimits(userId)

    if (!planLimits.analytics) {
      return {
        allowed: false,
        message: 'Tính năng phân tích chỉ khả dụng từ gói Cơ Bản trở lên. Vui lòng nâng cấp gói.'
      }
    }

    return { allowed: true, source: 'own' }
  }

  // Get history limit in months (null = unlimited)
  static async getHistoryLimit(userId: string): Promise<number | null> {
    const planLimits = await this.getUserPlanLimits(userId)
    return planLimits.historyMonths
  }

  // Check if user can use AI features
  static async canUseAI(userId: string): Promise<{ allowed: boolean; message?: string; source?: string }> {
    // First check if user is a tenant in any room
    const user = await User.findById(userId)
    if (!user) {
      return { allowed: false, message: 'User not found' }
    }

    // If user is a tenant, check if they're assigned to a room
    if (user.role === 'tenant') {
      const room = await Room.findOne({ tenantId: userId }).populate('landlordId')
      
      if (room && room.landlordId) {
        // Tenant has a room, check landlord's subscription
        const landlordId = (room.landlordId as any)._id.toString()
        const landlordPlanLimits = await this.getUserPlanLimits(landlordId)
        
        if (landlordPlanLimits.aiEnabled) {
          return { 
            allowed: true, 
            source: 'landlord',
            message: 'Bạn được sử dụng AI thông qua gói của chủ trọ'
          }
        }
      }
    }

    // Check user's own subscription
    const planLimits = await this.getUserPlanLimits(userId)

    if (!planLimits.aiEnabled) {
      return {
        allowed: false,
        message: 'Tính năng AI chỉ khả dụng từ gói Cơ Bản trở lên. Vui lòng nâng cấp gói để sử dụng AI Chatbot và phân tích thông minh.'
      }
    }

    return { allowed: true, source: 'own' }
  }

  // Check if user can use AI Insights (analysis + anomaly detection)
  static async canUseAIInsights(userId: string): Promise<{ allowed: boolean; message?: string; source?: string }> {
    // First check if user is a tenant in any room
    const user = await User.findById(userId)
    if (!user) {
      return { allowed: false, message: 'User not found' }
    }

    // If user is a tenant, check if they're assigned to a room
    if (user.role === 'tenant') {
      const room = await Room.findOne({ tenantId: userId }).populate('landlordId')
      
      if (room && room.landlordId) {
        // Tenant has a room, check landlord's subscription
        const landlordId = (room.landlordId as any)._id.toString()
        const landlordPlanLimits = await this.getUserPlanLimits(landlordId)
        
        if (landlordPlanLimits.aiInsights) {
          return { 
            allowed: true, 
            source: 'landlord',
            message: 'Bạn được sử dụng AI Insights thông qua gói của chủ trọ'
          }
        }
      }
    }

    // Check user's own subscription
    const planLimits = await this.getUserPlanLimits(userId)

    if (!planLimits.aiInsights) {
      return {
        allowed: false,
        message: 'Tính năng AI phân tích và phát hiện bất thường chỉ khả dụng từ gói Professional trở lên. Vui lòng nâng cấp gói.'
      }
    }

    return { allowed: true, source: 'own' }
  }

  // Update user subscription after purchase
  static async activateSubscription(userId: string, planName: string, duration: number = 1) {
    const user = await User.findById(userId)
    if (!user) throw new Error('User not found')

    const startDate = new Date()
    const endDate = new Date()
    endDate.setMonth(endDate.getMonth() + duration)

    // Update user's subscription info
    user.subscriptionPlan = planName as any
    user.subscriptionExpiry = endDate
    await user.save()

    return { startDate, endDate }
  }

  // Check and expire old subscriptions
  static async checkExpiredSubscriptions() {
    const expiredSubscriptions = await Subscription.find({
      status: 'active',
      endDate: { $lt: new Date() }
    })

    for (const subscription of expiredSubscriptions) {
      subscription.status = 'expired'
      await subscription.save()

      // Reset user to free plan based on role
      const user = await User.findById(subscription.userId)
      if (user) {
        user.subscriptionPlan = user.role === 'landlord' ? 'Gói Miễn Phí (Chủ Trọ)' : 'Gói Miễn Phí'
        user.subscriptionExpiry = undefined
        await user.save()
      }
    }

    return expiredSubscriptions.length
  }

  // Check if user can use PDF export
  static async canUsePDFExport(userId: string): Promise<boolean> {
    try {
      const user = await User.findById(userId).lean()
      if (!user) return false

      // Only landlords can use PDF export
      if (user.role !== 'landlord') return false

      const planLimits = await this.getUserPlanLimits(userId)
      return planLimits.pdfExport || false
    } catch (error) {
      console.error('Error checking PDF export access:', error)
      return false
    }
  }

  // Check if user can use support chat
  static async canUseSupport(userId: string): Promise<boolean> {
    try {
      const user = await User.findById(userId).lean()
      if (!user) return false

      // Only landlords can use support chat
      if (user.role !== 'landlord') return false

      const planLimits = await this.getUserPlanLimits(userId)
      return planLimits.support || false
    } catch (error) {
      console.error('Error checking support access:', error)
      return false
    }
  }
}
