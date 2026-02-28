import { Response } from 'express'
import { AuthRequest } from '../middleware/auth'
import MeterReading from '../models/MeterReading.model'
import User from '../models/User.model'
import Room from '../models/Room.model'
import { CalculationService } from '../services/calculation.service'

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id
    const { roomId } = req.query

    // Get user to check billing date and role
    const user = await User.findById(userId)
    const billingDate = user?.billingDate || 1
    let electricityRate = user?.electricityRate || 3000

    // Build query based on user role and roomId
    let query: any = {}
    
    if (roomId) {
      // Verify user has access to this room
      const room = await Room.findById(roomId)
      if (!room) {
        return res.status(404).json({ error: 'Room not found' })
      }
      
      // Use room's electricity rate
      electricityRate = room.electricityRate
      
      // Check if user is landlord of this room or tenant of this room
      const isLandlord = room.landlordId.toString() === userId
      const isTenant = room.tenantId?.toString() === userId
      
      if (!isLandlord && !isTenant) {
        return res.status(403).json({ error: 'Access denied to this room' })
      }
      
      // If user has access, get all readings for that room
      query.roomId = roomId
    } else {
      // If no roomId, check if user has a room (for tenant)
      if (user?.role === 'tenant') {
        const userRoom = await Room.findOne({ tenantId: userId })
        if (userRoom) {
          query.roomId = userRoom._id
          electricityRate = userRoom.electricityRate
        } else {
          // Tenant has no room, use userId
          query.userId = userId
        }
      } else {
        // For landlord without roomId, use userId
        query.userId = userId
      }
    }

    // Get all readings for the user/room
    const readings = await MeterReading.find(query)
      .sort({ createdAt: -1 })
      .limit(30)

    if (readings.length === 0) {
      return res.json({
        todayConsumption: 0,
        monthlyConsumption: 0,
        estimatedCost: 0,
        totalReadings: 0,
        lastReading: null
      })
    }

    // Calculate billing cycle dates
    const now = new Date()
    let cycleStartDate: Date
    
    if (now.getDate() >= billingDate) {
      // Current cycle: from billingDate of this month to billingDate of next month
      cycleStartDate = new Date(now.getFullYear(), now.getMonth(), billingDate)
    } else {
      // Current cycle: from billingDate of last month to billingDate of this month
      cycleStartDate = new Date(now.getFullYear(), now.getMonth() - 1, billingDate)
    }
    
    // Filter readings in current billing cycle
    const cycleReadings = readings.filter(r => r.createdAt >= cycleStartDate)
    
    // Calculate consumption as difference between latest and first reading in cycle
    let monthlyConsumption = 0
    if (cycleReadings.length >= 2) {
      const latestReading = cycleReadings[0] // Already sorted by createdAt desc
      const firstReading = cycleReadings[cycleReadings.length - 1]
      monthlyConsumption = (latestReading.value || 0) - (firstReading.value || 0)
    } else if (cycleReadings.length === 1) {
      // If only one reading in cycle, use its consumption value
      monthlyConsumption = cycleReadings[0].consumption || 0
    }
    
    const monthlyCost = CalculationService.calculateCost(monthlyConsumption, electricityRate)

    // Calculate daily average based on days since cycle start
    const daysSinceCycleStart = Math.ceil((now.getTime() - cycleStartDate.getTime()) / (1000 * 60 * 60 * 24))
    const dailyAverage = CalculationService.calculateDailyAverage(monthlyConsumption, daysSinceCycleStart)

    // Get latest reading
    const latestReading = readings[0]

    // Calculate consumption level
    const consumptionLevel = CalculationService.getConsumptionLevel(monthlyConsumption)

    res.json({
      monthlyConsumption: Math.round(monthlyConsumption * 100) / 100,
      monthlyCost,
      dailyAverage,
      consumptionLevel,
      totalReadings: readings.length,
      cycleStartDate,
      lastReading: {
        value: latestReading.value,
        date: latestReading.createdAt,
        consumption: latestReading.consumption,
        cost: latestReading.cost
      }
    })
  } catch (error) {
    console.error('Get dashboard stats error:', error)
    res.status(500).json({ error: 'Failed to get dashboard stats' })
  }
}

export const getConsumptionChart = async (req: AuthRequest, res: Response) => {
  try {
    const { type = 'daily', limit = 30, roomId, month } = req.query
    const userId = req.user?.id

    // Get user to check billing date
    const user = await User.findById(userId)
    const billingDate = user?.billingDate || 1
    let electricityRate = user?.electricityRate || 3000

    // Build query based on roomId with access control
    let query: any = {}
    
    if (roomId) {
      // Verify user has access to this room
      const room = await Room.findById(roomId)
      if (!room) {
        return res.status(404).json({ error: 'Room not found' })
      }
      
      electricityRate = room.electricityRate
      
      const isLandlord = room.landlordId.toString() === userId
      const isTenant = room.tenantId?.toString() === userId
      
      if (!isLandlord && !isTenant) {
        return res.status(403).json({ error: 'Access denied to this room' })
      }
      
      query.roomId = roomId
    } else {
      // If no roomId, check if user has a room
      if (user?.role === 'tenant') {
        const userRoom = await Room.findOne({ tenantId: userId })
        if (userRoom) {
          query.roomId = userRoom._id
          electricityRate = userRoom.electricityRate
        } else {
          query.userId = userId
        }
      } else {
        query.userId = userId
      }
    }

    // Filter by month if provided (format: YYYY-MM) - only for daily view
    if (month && typeof month === 'string' && type === 'daily') {
      const [year, monthNum] = month.split('-').map(Number)
      const startDate = new Date(year, monthNum - 1, billingDate)
      const endDate = new Date(year, monthNum, billingDate)
      // Add one day to endDate to ensure we include all readings on the billing date
      endDate.setDate(endDate.getDate() + 1)
      // Include readings from start date up to (but not including) the day after end date
      query.createdAt = { $gte: startDate, $lt: endDate }
    }

    // For monthly view, get more readings to ensure we have data for multiple cycles
    const readingLimit = type === 'monthly' ? 100 : Number(limit)
    
    const readings = await MeterReading.find(query)
      .sort({ createdAt: -1 })
      .limit(readingLimit)

    if (type === 'daily') {
      // Calculate progressive cost based on cumulative consumption
      let cumulativeConsumption = 0
      const dailyData = readings.reverse().map((reading, index) => {
        const consumption = index === 0 ? 0 : (reading.consumption || 0)
        
        // Calculate cost increment for this reading
        const previousCumulative = cumulativeConsumption
        cumulativeConsumption += consumption
        
        // Cost is the difference between cumulative costs
        const previousCost = CalculationService.calculateCost(previousCumulative, electricityRate)
        const currentCost = CalculationService.calculateCost(cumulativeConsumption, electricityRate)
        const incrementalCost = currentCost - previousCost
        
        return {
          date: new Date(reading.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
          consumption,
          cost: Math.round(incrementalCost),
          value: reading.value
        }
      })

      res.json({ data: dailyData })
    } else {
      // For monthly view: Find readings on billing dates and calculate consumption between them
      const sortedReadings = [...readings].sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      )
      
      // Find readings that are on or near billing date
      const billingReadings = sortedReadings.filter(reading => {
        const day = new Date(reading.createdAt).getDate()
        // Accept readings within 3 days of billing date
        return Math.abs(day - billingDate) <= 3
      })
      
      // Calculate consumption between consecutive billing readings
      const monthlyData = []
      for (let i = 0; i < billingReadings.length - 1; i++) {
        const startReading = billingReadings[i]
        const endReading = billingReadings[i + 1]
        
        const startDate = new Date(startReading.createdAt)
        const consumption = (endReading.value || 0) - (startReading.value || 0)
        const cost = CalculationService.calculateCost(consumption, electricityRate)
        
        const monthLabel = `tháng ${String(startDate.getMonth() + 1).padStart(2, '0')}, ${startDate.getFullYear()}`
        
        monthlyData.push({
          month: monthLabel,
          consumption: Math.round(consumption * 100) / 100,
          cost: Math.round(cost),
          count: 2,
          cycleMonth: startDate.getMonth(),
          cycleYear: startDate.getFullYear()
        })
      }
      
      // Sort and return last 3 cycles
      const result = monthlyData
        .sort((a, b) => {
          if (a.cycleYear !== b.cycleYear) {
            return a.cycleYear - b.cycleYear
          }
          return a.cycleMonth - b.cycleMonth
        })
        .slice(-3)

      res.json({ data: result })
    }
  } catch (error) {
    console.error('Get consumption chart error:', error)
    res.status(500).json({ error: 'Failed to get consumption chart' })
  }
}

export const getTips = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id

    // Get user's consumption level to provide personalized tips
    const readings = await MeterReading.find({ userId })
      .sort({ createdAt: -1 })
      .limit(30)

    const monthlyConsumption = readings.reduce((sum, r) => sum + (r.consumption || 0), 0)
    const level = CalculationService.getConsumptionLevel(monthlyConsumption)

    const allTips = [
      {
        id: '1',
        title: 'Tắt Điều Hòa Khi Không Sử Dụng',
        description: 'Điều hòa tiêu thụ 30-40% tổng điện năng. Tắt khi ra khỏi phòng trên 30 phút.',
        savings: '30-40%',
        category: 'cooling',
        level: ['medium', 'high']
      },
      {
        id: '2',
        title: 'Sử Dụng Đèn LED',
        description: 'Đèn LED tiêu thụ ít điện hơn 80% so với đèn sợi đốt và tuổi thọ cao hơn.',
        savings: '80%',
        category: 'lighting',
        level: ['low', 'medium', 'high']
      },
      {
        id: '3',
        title: 'Rút Phích Cắm Thiết Bị Không Dùng',
        description: 'Thiết bị ở chế độ chờ vẫn tiêu thụ 5-10% điện năng.',
        savings: '5-10%',
        category: 'general',
        level: ['low', 'medium', 'high']
      },
      {
        id: '4',
        title: 'Đặt Nhiệt Độ Điều Hòa 25-26°C',
        description: 'Mỗi độ giảm xuống tiêu thụ thêm 3-5% điện năng.',
        savings: '10-15%',
        category: 'cooling',
        level: ['medium', 'high']
      },
      {
        id: '5',
        title: 'Vệ Sinh Điều Hòa Định Kỳ',
        description: 'Lọc bẩn làm tăng tiêu thụ điện lên 15-20%.',
        savings: '15-20%',
        category: 'cooling',
        level: ['medium', 'high']
      }
    ]

    // Filter tips based on consumption level
    const relevantTips = allTips.filter(tip => tip.level.includes(level))

    res.json({ tips: relevantTips, consumptionLevel: level })
  } catch (error) {
    console.error('Get tips error:', error)
    res.status(500).json({ error: 'Failed to get tips' })
  }
}

export const getInvoice = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id
    const { month, roomId } = req.query

    if (!month || typeof month !== 'string') {
      return res.status(400).json({ error: 'Month parameter is required (format: YYYY-MM)' })
    }

    // Get user to check billing date
    const user = await User.findById(userId)
    const billingDate = user?.billingDate || 1
    let electricityRate = user?.electricityRate || 3000

    // Parse month (format: YYYY-MM)
    const [year, monthNum] = month.split('-').map(Number)
    
    // Calculate billing cycle dates
    const cycleStartDate = new Date(year, monthNum - 1, billingDate)
    const cycleEndDate = new Date(year, monthNum, billingDate)

    // Build query based on roomId with access control
    let query: any = {}
    
    if (roomId) {
      // Verify user has access to this room
      const room = await Room.findById(roomId)
      if (!room) {
        return res.status(404).json({ error: 'Room not found' })
      }
      
      electricityRate = room.electricityRate
      
      const isLandlord = room.landlordId.toString() === userId
      const isTenant = room.tenantId?.toString() === userId
      
      if (!isLandlord && !isTenant) {
        return res.status(403).json({ error: 'Access denied to this room' })
      }
      
      query.roomId = roomId
    } else {
      // If no roomId, check if user has a room
      if (user?.role === 'tenant') {
        const userRoom = await Room.findOne({ tenantId: userId })
        if (userRoom) {
          query.roomId = userRoom._id
          electricityRate = userRoom.electricityRate
        } else {
          query.userId = userId
        }
      } else {
        query.userId = userId
      }
    }

    // Get all readings to find the ones closest to billing dates
    const allReadings = await MeterReading.find(query).sort({ createdAt: 1 })

    // Find reading closest to cycle start date (within ±3 days)
    let startReading = null
    let minStartDiff = Infinity
    
    // Find reading closest to cycle end date (within ±3 days)
    let endReading = null
    let minEndDiff = Infinity

    for (const reading of allReadings) {
      const readingDate = new Date(reading.createdAt)
      
      // Check for start reading
      const startDiff = Math.abs(readingDate.getTime() - cycleStartDate.getTime())
      const startDiffDays = startDiff / (1000 * 60 * 60 * 24)
      if (startDiffDays <= 3 && startDiff < minStartDiff) {
        minStartDiff = startDiff
        startReading = reading
      }
      
      // Check for end reading
      const endDiff = Math.abs(readingDate.getTime() - cycleEndDate.getTime())
      const endDiffDays = endDiff / (1000 * 60 * 60 * 24)
      if (endDiffDays <= 3 && endDiff < minEndDiff) {
        minEndDiff = endDiff
        endReading = reading
      }
    }

    let consumption = 0
    if (startReading && endReading && startReading._id.toString() !== endReading._id.toString()) {
      consumption = (endReading.value || 0) - (startReading.value || 0)
    } else if (startReading && !endReading) {
      // Only start reading found, use its consumption
      consumption = startReading.consumption || 0
    }

    const cost = CalculationService.calculateCost(consumption, electricityRate)

    res.json({
      consumption: Math.round(consumption * 100) / 100,
      cost: Math.round(cost),
      cycleStart: cycleStartDate,
      cycleEnd: cycleEndDate,
      startReading: startReading ? { date: startReading.createdAt, value: startReading.value } : null,
      endReading: endReading ? { date: endReading.createdAt, value: endReading.value } : null
    })
  } catch (error) {
    console.error('Get invoice error:', error)
    res.status(500).json({ error: 'Failed to get invoice' })
  }
}
