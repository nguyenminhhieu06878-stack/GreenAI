import { Response } from 'express'
import { AuthRequest } from '../middleware/auth.js'
import MeterReading from '../models/MeterReading.model.js'
import User from '../models/User.model.js'
import Room from '../models/Room.model.js'
import OCRTraining from '../models/OCRTraining.model.js'
import { CalculationService } from '../services/calculation.service.js'
import { OCRService } from '../services/ocr.service.js'
import { SubscriptionService } from '../services/subscription.service.js'

export const uploadMeterImage = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image provided' })
    }

    // Check if user can use OCR
    const canUseOCR = await SubscriptionService.canUseOCR(req.user?.id!)
    if (!canUseOCR.allowed) {
      return res.status(403).json({ error: canUseOCR.message })
    }

    const { roomId } = req.body

    // Use OCR to extract meter reading from image
    console.log('Processing image:', req.file.path)
    const { value: mockReading, confidence, rawText } = await OCRService.extractMeterReading(req.file.path)
    
    // Check if OCR failed
    if (mockReading === 0 && confidence === 0) {
      return res.status(400).json({ 
        error: 'Không thể đọc được số từ ảnh. Vui lòng thử lại với ảnh rõ hơn hoặc nhập thủ công.',
        tips: [
          '✅ Đảm bảo ánh sáng đủ sáng',
          '✅ Chụp thẳng góc với đồng hồ',
          '✅ Số phải rõ ràng và trong tiêu cự',
          '✅ Lau sạch mặt kính đồng hồ',
          '✅ Ảnh không quá nhỏ (tối thiểu 300x300px)',
          '✅ Zoom vào số trước khi chụp'
        ]
      })
    }

    // Get previous reading to calculate consumption
    // Priority: Find by roomId if available, otherwise by userId
    let previousReading = null
    let electricityRate = undefined // Will use default if not set
    
    if (roomId) {
      // Get room to fetch electricity rate
      const room = await Room.findById(roomId)
      if (room) {
        electricityRate = room.electricityRate
      }
      
      // Find latest reading for this room (regardless of who entered it)
      previousReading = await MeterReading.findOne({ roomId })
        .sort({ createdAt: -1 })
    } else {
      // Get user's electricity rate
      const user = await User.findById(req.user?.id)
      if (user) {
        electricityRate = user.electricityRate
      }
      
      // Fallback: find by userId
      previousReading = await MeterReading.findOne({ userId: req.user?.id })
        .sort({ createdAt: -1 })
    }

    let consumption = 0
    let cost = 0
    let days = 0

    if (previousReading) {
      consumption = CalculationService.calculateConsumption(mockReading, previousReading.value)
      cost = CalculationService.calculateCost(consumption, electricityRate)
      days = CalculationService.calculateDaysBetween(previousReading.createdAt, new Date())
    }

    const reading = await MeterReading.create({
      userId: req.user?.id,
      roomId: roomId || undefined,
      value: mockReading,
      imagePath: req.file.path,
      method: 'auto',
      confidence,
      consumption,
      cost
    })

    res.json({
      reading: mockReading,
      confidence,
      consumption,
      cost,
      days,
      id: reading._id,
      rawText // Send raw text to frontend for debugging
    })
  } catch (error) {
    console.error('Upload meter image error:', error)
    res.status(500).json({ error: 'Failed to process image' })
  }
}

export const addManualReading = async (req: AuthRequest, res: Response) => {
  try {
    const { value, date, notes, roomId } = req.body
    
    const readingDate = date ? new Date(date) : new Date()

    // Get previous reading to calculate consumption
    // Priority: Find by roomId if available, otherwise by userId
    let previousReading = null
    let electricityRate = undefined // Will use default if not set
    
    if (roomId) {
      // Get room to fetch electricity rate
      const room = await Room.findById(roomId)
      if (room) {
        electricityRate = room.electricityRate
      }
      
      // Find latest reading for this room before the current reading date
      previousReading = await MeterReading.findOne({ 
        roomId,
        createdAt: { $lt: readingDate }
      }).sort({ createdAt: -1 })
    } else {
      // Get user's electricity rate
      const user = await User.findById(req.user?.id)
      if (user) {
        electricityRate = user.electricityRate
      }
      
      // Fallback: find by userId before the current reading date
      previousReading = await MeterReading.findOne({ 
        userId: req.user?.id,
        createdAt: { $lt: readingDate }
      }).sort({ createdAt: -1 })
    }

    let consumption = 0
    let cost = 0

    if (previousReading) {
      consumption = CalculationService.calculateConsumption(parseFloat(value), previousReading.value)
      cost = CalculationService.calculateCost(consumption, electricityRate)
    }

    const reading = await MeterReading.create({
      userId: req.user?.id,
      roomId: roomId || undefined,
      value: parseFloat(value),
      method: 'manual',
      notes,
      consumption,
      cost,
      createdAt: readingDate
    })

    res.json({ reading })
  } catch (error) {
    console.error('Add manual reading error:', error)
    res.status(500).json({ error: 'Failed to add reading' })
  }
}

export const getReadings = async (req: AuthRequest, res: Response) => {
  try {
    const { limit = 50, skip = 0, roomId } = req.query
    const userId = req.user?.id
    const user = await User.findById(userId)

    // Build query based on roomId with access control
    let query: any = {}
    
    if (roomId) {
      // Verify user has access to this room
      const room = await Room.findById(roomId)
      
      if (room) {
        const isLandlord = room.landlordId.toString() === userId
        const isTenant = room.tenantId?.toString() === userId
        
        if (isLandlord || isTenant) {
          // User has access, get room readings
          query.roomId = roomId
        } else {
          // User doesn't have access to this room, fallback to personal readings
          query.userId = userId
        }
      } else {
        // Room not found, fallback to personal readings
        query.userId = userId
      }
    } else {
      // If no roomId provided, check if user has a room
      if (user?.role === 'tenant') {
        const userRoom = await Room.findOne({ tenantId: userId })
        if (userRoom) {
          // Tenant has a room, get readings for that room
          query.roomId = userRoom._id
        } else {
          // Tenant has no room, get their personal readings (without roomId)
          query.userId = userId
          query.roomId = { $exists: false }
        }
      } else if (user?.role === 'landlord') {
        // Landlord without roomId, get all their personal readings
        query.userId = userId
      } else {
        // Default: get by userId
        query.userId = userId
      }
    }

    const readings = await MeterReading.find(query)
      .populate('userId', 'name email role')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(Number(skip))

    const total = await MeterReading.countDocuments(query)

    res.json({ 
      readings,
      total,
      hasMore: total > Number(skip) + readings.length
    })
  } catch (error) {
    console.error('Get readings error:', error)
    res.status(500).json({ error: 'Failed to get readings' })
  }
}

export const deleteReading = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const userId = req.user?.id

    const reading = await MeterReading.findById(id)
    
    if (!reading) {
      return res.status(404).json({ error: 'Reading not found' })
    }

    // Get user info
    const user = await User.findById(userId)
    
    // Check permission
    const isOwner = reading.userId.toString() === userId
    const isLandlord = user?.role === 'landlord'
    
    // Tenant can only delete their own readings
    // Landlord can delete any readings
    if (!isOwner && !isLandlord) {
      return res.status(403).json({ error: 'You can only delete your own readings' })
    }

    await MeterReading.findByIdAndDelete(id)

    res.json({ message: 'Reading deleted successfully' })
  } catch (error) {
    console.error('Delete reading error:', error)
    res.status(500).json({ error: 'Failed to delete reading' })
  }
}

export const updateReading = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const { value } = req.body
    const userId = req.user?.id

    const reading = await MeterReading.findById(id)
    
    if (!reading) {
      return res.status(404).json({ error: 'Reading not found' })
    }

    // Get user info
    const user = await User.findById(userId)
    
    // Check permission
    const isOwner = reading.userId.toString() === userId
    const isLandlord = user?.role === 'landlord'
    
    // Only owner or landlord can update
    if (!isOwner && !isLandlord) {
      return res.status(403).json({ error: 'You can only update your own readings' })
    }

    // If this was an OCR reading and user is correcting it, save for training
    if (reading.method === 'auto' && reading.value !== parseFloat(value) && reading.imagePath) {
      try {
        await OCRTraining.create({
          imagePath: reading.imagePath,
          ocrResult: reading.value,
          correctValue: parseFloat(value),
          confidence: reading.confidence || 0,
          userId: userId
        })
        console.log('✅ Saved OCR training data: OCR said', reading.value, 'but correct is', value)
      } catch (error) {
        console.error('Failed to save OCR training data:', error)
        // Don't fail the update if training save fails
      }
    }

    // Update value and recalculate consumption/cost
    const query: any = { userId: reading.userId }
    if (reading.roomId) {
      query.roomId = reading.roomId
    }

    const previousReading = await MeterReading.findOne({
      ...query,
      createdAt: { $lt: reading.createdAt }
    }).sort({ createdAt: -1 })

    let consumption = 0
    let cost = 0
    let electricityRate = undefined

    // Get electricity rate from room or user
    if (reading.roomId) {
      const room = await Room.findById(reading.roomId)
      if (room) {
        electricityRate = room.electricityRate
      }
    } else {
      if (user) {
        electricityRate = user.electricityRate
      }
    }

    if (previousReading) {
      consumption = CalculationService.calculateConsumption(parseFloat(value), previousReading.value)
      cost = CalculationService.calculateCost(consumption, electricityRate)
    }

    reading.value = parseFloat(value)
    reading.consumption = consumption
    reading.cost = cost
    await reading.save()

    res.json({ reading })
  } catch (error) {
    console.error('Update reading error:', error)
    res.status(500).json({ error: 'Failed to update reading' })
  }
}
