import { Response } from 'express'
import { AuthRequest } from '../middleware/auth'
import CheckIn from '../models/CheckIn.model'
import Voucher from '../models/Voucher.model'

// Get user's check-in status
export const getCheckInStatus = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id

    let checkIn = await CheckIn.findOne({ userId })

    if (!checkIn) {
      // Create new check-in record
      checkIn = await CheckIn.create({
        userId,
        checkInDate: new Date(),
        streak: 0,
        totalCheckIns: 0,
        checkInHistory: []
      })
    }

    // Check if user has any unused and valid vouchers
    const vouchers = await Voucher.find({
      userId,
      isUsed: false,
      expiresAt: { $gt: new Date() }
    }).sort({ createdAt: -1 })

    res.json({
      streak: checkIn.streak,
      totalCheckIns: checkIn.totalCheckIns,
      lastCheckIn: checkIn.lastCheckIn,
      canCheckIn: canCheckInToday(checkIn.lastCheckIn),
      checkInHistory: checkIn.checkInHistory || [],
      vouchers
    })
  } catch (error) {
    console.error('Get check-in status error:', error)
    res.status(500).json({ error: 'Failed to get check-in status' })
  }
}

// Perform check-in
export const checkIn = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id
    const { testMode } = req.body // Test mode để test nhiều lần

    let checkIn = await CheckIn.findOne({ userId })

    if (!checkIn) {
      checkIn = await CheckIn.create({
        userId,
        checkInDate: new Date(),
        streak: 1,
        totalCheckIns: 1,
        lastCheckIn: new Date(),
        checkInHistory: [new Date()]
      })
    } else {
      // Check if already checked in today (skip in test mode)
      if (!testMode && !canCheckInToday(checkIn.lastCheckIn)) {
        return res.status(400).json({ error: 'Bạn đã điểm danh hôm nay rồi!' })
      }

      // In test mode, always increment streak
      if (testMode) {
        checkIn.streak += 1
      } else {
        // Just increment streak, no need to check consecutive days
        checkIn.streak += 1
      }

      checkIn.totalCheckIns += 1
      checkIn.lastCheckIn = new Date()
      checkIn.checkInDate = new Date()
      
      // Add to history
      if (!checkIn.checkInHistory) {
        checkIn.checkInHistory = []
      }
      checkIn.checkInHistory.push(new Date())

      await checkIn.save()
    }

    // Check if user reached 25 days streak
    let voucherCreated = false
    let newVoucher = null
    let resetStreak = false
    
    console.log('Current streak:', checkIn.streak);
    
    if (checkIn.streak === 25) {
      console.log('Reached 25 days! Checking for existing voucher...');
      
      // Check if user already has an unused voucher for this cycle
      const existingVoucher = await Voucher.findOne({
        userId,
        type: 'check-in',
        isUsed: false,
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Within last 30 days
      })

      console.log('Existing voucher:', existingVoucher);

      if (!existingVoucher) {
        console.log('Creating new voucher from template...');
        
        // Use the random voucher system from templates
        const VoucherTemplate = (await import('../models/VoucherTemplate.model')).default
        
        // Get all active templates with remaining quantity
        const templates = await VoucherTemplate.find({
          isActive: true,
          remaining: { $gt: 0 }
        })

        if (templates.length > 0) {
          // Check validity dates
          const now = new Date()
          const validTemplates = templates.filter(t => {
            if (t.validFrom && t.validFrom > now) return false
            if (t.validUntil && t.validUntil < now) return false
            return true
          })

          if (validTemplates.length > 0) {
            // Weighted random selection based on probability
            const totalProbability = validTemplates.reduce((sum, t) => sum + t.probability, 0)
            let random = Math.random() * totalProbability
            
            let selectedTemplate = validTemplates[0]
            for (const template of validTemplates) {
              random -= template.probability
              if (random <= 0) {
                selectedTemplate = template
                break
              }
            }

            // Generate unique voucher code
            const voucherCode = `TREE25-${userId.toString().slice(-6).toUpperCase()}-${Date.now().toString().slice(-4)}`
            const expiresAt = new Date()
            expiresAt.setDate(expiresAt.getDate() + 30) // Valid for 30 days

            // Create voucher for user
            newVoucher = await Voucher.create({
              userId,
              templateId: selectedTemplate._id,
              code: voucherCode,
              value: selectedTemplate.value,
              discount: parseInt(selectedTemplate.value) || 0, // Extract percentage number
              type: 'check-in',
              isUsed: false,
              expiresAt
            })

            // Decrease remaining quantity
            selectedTemplate.remaining -= 1
            await selectedTemplate.save()

            console.log(`Voucher created from template: ${selectedTemplate.name}`, newVoucher);
            voucherCreated = true
          } else {
            console.log('No valid templates available');
          }
        } else {
          console.log('No active templates with remaining quantity');
        }
      } else {
        console.log('Voucher already exists, skipping creation');
      }

      // Reset streak after reaching 25 days
      checkIn.streak = 0
      checkIn.checkInHistory = []
      resetStreak = true
      await checkIn.save()
      console.log('Streak reset to 0');
    } else if (checkIn.streak > 25) {
      console.log('Streak over 25, resetting...');
      // If somehow streak went over 25, reset it
      checkIn.streak = 0
      checkIn.checkInHistory = []
      resetStreak = true
      await checkIn.save()
    }

    res.json({
      message: resetStreak ? '🎉 Hoàn thành thử thách! Cây đã được reset để bắt đầu chu kỳ mới!' : 'Điểm danh thành công!',
      streak: checkIn.streak,
      totalCheckIns: checkIn.totalCheckIns,
      voucherCreated,
      voucher: newVoucher ? {
        code: newVoucher.code,
        value: newVoucher.value,
        discount: newVoucher.discount,
        expiresAt: newVoucher.expiresAt
      } : null,
      resetStreak,
      voucherMessage: voucherCreated && newVoucher ? `🎉 Chúc mừng! Bạn nhận được voucher giảm ${newVoucher.value}!` : undefined
    })
  } catch (error) {
    console.error('Check-in error:', error)
    res.status(500).json({ error: 'Failed to check in' })
  }
}

// Get user's vouchers
export const getVouchers = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id
    const { includeUsed } = req.query

    const query: any = { userId }
    
    // By default, only show unused vouchers
    if (includeUsed !== 'true') {
      query.isUsed = false
      query.expiresAt = { $gt: new Date() }
    }

    const vouchers = await Voucher.find(query)
      .sort({ createdAt: -1 })

    res.json({ vouchers })
  } catch (error) {
    console.error('Get vouchers error:', error)
    res.status(500).json({ error: 'Failed to get vouchers' })
  }
}

// Validate voucher
export const validateVoucher = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id
    const { code } = req.body

    const voucher = await Voucher.findOne({
      code,
      userId,
      isUsed: false,
      expiresAt: { $gt: new Date() }
    })

    if (!voucher) {
      return res.status(400).json({ error: 'Voucher không hợp lệ hoặc đã hết hạn' })
    }

    res.json({
      valid: true,
      discount: voucher.discount,
      value: voucher.value,
      code: voucher.code
    })
  } catch (error) {
    console.error('Validate voucher error:', error)
    res.status(500).json({ error: 'Failed to validate voucher' })
  }
}

// Use/Apply voucher (mark as used)
export const useVoucher = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id
    const { code } = req.body

    const voucher = await Voucher.findOne({
      code,
      userId,
      isUsed: false,
      expiresAt: { $gt: new Date() }
    })

    if (!voucher) {
      return res.status(400).json({ error: 'Voucher không hợp lệ hoặc đã hết hạn' })
    }

    // Mark voucher as used
    voucher.isUsed = true
    voucher.usedAt = new Date()
    await voucher.save()

    res.json({
      message: 'Đã áp dụng voucher thành công',
      voucher: {
        code: voucher.code,
        value: voucher.value,
        discount: voucher.discount,
        usedAt: voucher.usedAt
      }
    })
  } catch (error) {
    console.error('Use voucher error:', error)
    res.status(500).json({ error: 'Failed to use voucher' })
  }
}

// Helper functions
function canCheckInToday(lastCheckIn: Date | undefined): boolean {
  if (!lastCheckIn) return true

  const today = new Date()
  const lastCheckInDate = new Date(lastCheckIn)

  return !isSameDay(today, lastCheckInDate)
}

function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}
