import Groq from 'groq-sdk'
import MeterReading from '../models/MeterReading.model.js'
import User from '../models/User.model.js'
import Room from '../models/Room.model.js'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || ''
})

export class AIService {
  // Main chatbot function
  static async chat(userId: string, message: string, conversationHistory: any[] = []) {
    try {
      // Get user context
      const context = await this.getUserContext(userId)
      
      // Build system prompt
      const systemPrompt = this.buildSystemPrompt(context)
      
      // Build messages
      const messages: any[] = [
        { role: 'system', content: systemPrompt },
        ...conversationHistory,
        { role: 'user', content: message }
      ]

      // Call Groq API
      const completion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages,
        temperature: 0.7,
        max_tokens: 1024,
        top_p: 1,
        stream: false
      })

      const response = completion.choices[0]?.message?.content || 'Xin lỗi, tôi không thể trả lời câu hỏi này.'

      return {
        response,
        context
      }
    } catch (error) {
      console.error('AI chat error:', error)
      throw new Error('Failed to get AI response')
    }
  }

  // Get user context for AI
  static async getUserContext(userId: string) {
    const user = await User.findById(userId)
    if (!user) return null

    // Calculate current billing cycle
    const billingDate = user.billingDate || 1
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    
    // Determine cycle start date
    let cycleStartDate: Date
    if (now.getDate() >= billingDate) {
      // Current cycle: billingDate of current month to billingDate of next month
      cycleStartDate = new Date(currentYear, currentMonth, billingDate)
    } else {
      // Current cycle: billingDate of last month to billingDate of current month
      cycleStartDate = new Date(currentYear, currentMonth - 1, billingDate)
    }

    // Get user's room (for tenant) or rooms (for landlord)
    let userRoom = null
    let rooms: any[] = []
    
    if (user.role === 'tenant') {
      userRoom = await Room.findOne({ tenantId: userId })
    } else if (user.role === 'landlord') {
      rooms = await Room.find({ landlordId: userId })
        .populate('tenantId', 'name email')
    }

    // Build query for readings
    let readingsQuery: any = { createdAt: { $gte: cycleStartDate } }
    
    if (userRoom) {
      // If tenant has a room, get all readings for that room (shared with landlord)
      readingsQuery.roomId = userRoom._id
    } else if (rooms.length > 0) {
      // If landlord, get readings from all their rooms
      readingsQuery.roomId = { $in: rooms.map(r => r._id) }
    } else {
      // Fallback to userId if no room found
      readingsQuery.userId = userId
    }

    // Get readings for current billing cycle
    const readings = await MeterReading.find(readingsQuery)
      .sort({ createdAt: -1 })
      .populate('roomId', 'name')
      .populate('userId', 'name role')

    // Calculate statistics for current month
    // Use difference between latest and earliest reading in cycle
    let totalConsumption = 0
    let totalCost = 0
    
    if (readings.length >= 2) {
      const latestReading = readings[0]
      const earliestReading = readings[readings.length - 1]
      totalConsumption = (latestReading.value || 0) - (earliestReading.value || 0)
      
      // Recalculate cost based on actual consumption
      const CalculationService = (await import('./calculation.service.js')).CalculationService
      totalCost = CalculationService.calculateCost(totalConsumption)
    } else if (readings.length === 1) {
      // Only one reading, use its consumption
      totalConsumption = readings[0].consumption || 0
      totalCost = readings[0].cost || 0
    }
    
    const avgConsumption = readings.length > 0 ? totalConsumption / readings.length : 0

    // Get latest reading for current month
    const latestReading = readings.length > 0 ? readings[0] : null

    return {
      user: {
        name: user.name,
        role: user.role,
        subscriptionPlan: user.subscriptionPlan,
        billingDate,
        room: userRoom ? userRoom.name : null
      },
      currentMonth: {
        cycleStart: cycleStartDate.toLocaleDateString('vi-VN'),
        totalConsumption,
        totalCost,
        readingCount: readings.length
      },
      latestReading: latestReading ? {
        value: latestReading.value,
        consumption: latestReading.consumption,
        cost: latestReading.cost,
        date: latestReading.createdAt,
        room: latestReading.roomId ? (latestReading.roomId as any).name : null
      } : null,
      readings: readings.map(r => ({
        value: r.value,
        consumption: r.consumption,
        cost: r.cost,
        date: r.createdAt,
        room: r.roomId ? (r.roomId as any).name : null,
        enteredBy: r.userId ? `${(r.userId as any).name} (${(r.userId as any).role === 'landlord' ? 'Chủ trọ' : 'Người thuê'})` : null
      })),
      statistics: {
        totalConsumption,
        totalCost,
        avgConsumption,
        readingCount: readings.length
      },
      rooms: rooms.map(r => ({
        name: r.name,
        tenant: r.tenantId ? (r.tenantId as any).name : 'Trống',
        status: r.tenantId ? 'Đã thuê' : 'Trống'
      }))
    }
  }

  // Build system prompt
  static buildSystemPrompt(context: any) {
    if (!context) {
      return `Bạn là trợ lý AI thông minh của ứng dụng quản lý điện năng GreenEnergy. 
Nhiệm vụ của bạn là giúp người dùng hiểu về tiêu thụ điện và đưa ra lời khuyên tiết kiệm điện.
Trả lời bằng tiếng Việt, thân thiện và chuyên nghiệp.`
    }

    const { user, currentMonth, latestReading, statistics, readings, rooms } = context

    let prompt = `Bạn là trợ lý AI thông minh của ứng dụng quản lý điện năng GreenEnergy.

THÔNG TIN NGƯỜI DÙNG:
- Tên: ${user.name}
- Vai trò: ${user.role === 'tenant' ? 'Người thuê' : user.role === 'landlord' ? 'Chủ trọ' : 'Quản trị viên'}
- Gói dịch vụ: ${user.subscriptionPlan}
- Ngày thanh toán: ${user.billingDate} hàng tháng

CHU KỲ THANH TOÁN HIỆN TẠI:
- Bắt đầu từ: ${currentMonth.cycleStart}
- Tổng tiêu thụ tháng này: ${currentMonth.totalConsumption.toFixed(1)} kWh
- Tổng chi phí tháng này: ${currentMonth.totalCost.toLocaleString('vi-VN')} đồng
- Số lần nhập chỉ số: ${currentMonth.readingCount}
`

    if (latestReading) {
      prompt += `\nCHỈ SỐ MỚI NHẤT:
- Ngày: ${new Date(latestReading.date).toLocaleDateString('vi-VN')}
- Tiêu thụ: ${latestReading.consumption.toFixed(1)} kWh
- Chi phí: ${latestReading.cost.toLocaleString('vi-VN')} đồng`
      if (latestReading.room) prompt += `\n- Phòng: ${latestReading.room}`
      prompt += '\n'
    }

    if (readings.length > 1) {
      prompt += `\nLỊCH SỬ THÁNG NÀY (${Math.min(5, readings.length)} lần gần nhất):\n`
      readings.slice(0, 5).forEach((r: any, i: number) => {
        prompt += `${i + 1}. ${new Date(r.date).toLocaleDateString('vi-VN')}: ${r.consumption.toFixed(1)} kWh, ${r.cost.toLocaleString('vi-VN')}đ`
        if (r.room) prompt += ` (${r.room})`
        prompt += '\n'
      })
    }

    if (user.role === 'landlord' && rooms.length > 0) {
      prompt += `\nPHÒNG QUẢN LÝ (${rooms.length} phòng):\n`
      rooms.slice(0, 5).forEach((r: any, i: number) => {
        prompt += `${i + 1}. ${r.name}: ${r.status} - ${r.tenant}\n`
      })
    }

    prompt += `\nQUY TẮC QUAN TRỌNG:
- CHỈ trả lời về dữ liệu của CHU KỲ THANH TOÁN HIỆN TẠI (từ ${currentMonth.cycleStart})
- Tổng tiêu thụ tháng này là ${currentMonth.totalConsumption.toFixed(1)} kWh, KHÔNG PHẢI con số khác
- Nếu người dùng hỏi về "tháng này", hãy dùng số liệu từ currentMonth
- Nếu chưa có dữ liệu tháng này, hãy nói rõ

NHIỆM VỤ CỦA BẠN:
1. Trả lời câu hỏi về tiêu thụ điện dựa trên dữ liệu CHU KỲ HIỆN TẠI
2. Đưa ra lời khuyên tiết kiệm điện cụ thể
3. Phân tích xu hướng tiêu thụ trong tháng
4. Phát hiện bất thường (tăng/giảm đột ngột)
5. Giải thích hóa đơn điện
6. Hướng dẫn sử dụng app

Trả lời bằng tiếng Việt, ngắn gọn (2-4 câu), thân thiện và hữu ích.
Nếu phát hiện bất thường, hãy cảnh báo rõ ràng.`

    return prompt
  }

  // Analyze consumption patterns
  static async analyzeConsumption(userId: string, roomId?: string) {
    const query: any = { userId }
    if (roomId) {
      query.roomId = roomId
    }

    const readings = await MeterReading.find(query)
      .sort({ createdAt: -1 })
      .limit(30)

    if (readings.length < 3) {
      return {
        insights: [],
        anomalies: [],
        recommendations: ['Cần thêm dữ liệu để phân tích. Hãy nhập thêm chỉ số điện.']
      }
    }

    const insights: string[] = []
    const anomalies: string[] = []
    const recommendations: string[] = []

    // Calculate average
    const avgConsumption = readings.reduce((sum, r) => sum + r.consumption, 0) / readings.length

    // Check for anomalies (consumption > 150% of average)
    const recentReadings = readings.slice(0, 5)
    recentReadings.forEach(reading => {
      if (reading.consumption > avgConsumption * 1.5) {
        anomalies.push(`⚠️ Phát hiện bất thường: Ngày ${new Date(reading.createdAt).toLocaleDateString('vi-VN')} tiêu thụ ${reading.consumption.toFixed(1)} kWh, cao hơn ${((reading.consumption / avgConsumption - 1) * 100).toFixed(0)}% so với trung bình`)
      }
    })

    // Trend analysis
    const recent5 = readings.slice(0, 5)
    const previous5 = readings.slice(5, 10)
    
    if (previous5.length >= 5) {
      const recentAvg = recent5.reduce((sum, r) => sum + r.consumption, 0) / 5
      const previousAvg = previous5.reduce((sum, r) => sum + r.consumption, 0) / 5
      const change = ((recentAvg - previousAvg) / previousAvg) * 100

      if (Math.abs(change) > 10) {
        if (change > 0) {
          insights.push(`📈 Tiêu thụ điện tăng ${change.toFixed(0)}% so với trước đây`)
          recommendations.push('Kiểm tra các thiết bị điện, có thể có thiết bị hỏng hoặc tiêu thụ nhiều điện')
        } else {
          insights.push(`📉 Tiêu thụ điện giảm ${Math.abs(change).toFixed(0)}% - Tuyệt vời!`)
        }
      } else {
        insights.push(`✅ Tiêu thụ điện ổn định`)
      }
    }

    // General recommendations
    if (avgConsumption > 100) {
      recommendations.push('💡 Tiêu thụ điện khá cao. Hãy tắt thiết bị không dùng, sử dụng đèn LED')
    }
    
    if (avgConsumption > 150) {
      recommendations.push('❄️ Nếu dùng điều hòa, đặt nhiệt độ 26°C để tiết kiệm điện')
    }

    recommendations.push('🔌 Rút phích cắm các thiết bị không sử dụng để tránh tiêu thụ điện chờ')

    return {
      insights,
      anomalies,
      recommendations,
      avgConsumption: avgConsumption.toFixed(1),
      totalReadings: readings.length
    }
  }

  // Detect anomalies
  static async detectAnomalies(userId: string, roomId?: string) {
    // Build query with access control
    const query: any = {}
    
    if (roomId) {
      // Verify user has access to this room
      const room = await Room.findById(roomId)
      if (!room) {
        throw new Error('Room not found')
      }
      
      const isLandlord = room.landlordId.toString() === userId
      const isTenant = room.tenantId?.toString() === userId
      
      if (!isLandlord && !isTenant) {
        // User doesn't have access, fallback to personal data
        query.userId = userId
        query.roomId = { $exists: false }
      } else {
        // User has access, query by roomId
        query.roomId = roomId
      }
    } else {
      query.userId = userId
    }

    // Get user's billing date
    const user = await User.findById(userId)
    const billingDate = user?.billingDate || 1

    // Calculate current billing cycle
    const now = new Date()
    let cycleStartDate: Date
    
    if (now.getDate() >= billingDate) {
      // Current cycle: from billingDate of this month
      cycleStartDate = new Date(now.getFullYear(), now.getMonth(), billingDate)
    } else {
      // Current cycle: from billingDate of last month
      cycleStartDate = new Date(now.getFullYear(), now.getMonth() - 1, billingDate)
    }

    // Only get readings from current billing cycle
    query.createdAt = { $gte: cycleStartDate }

    const readings = await MeterReading.find(query)
      .sort({ createdAt: -1 })
      .limit(20)

    if (readings.length < 2) {
      return { hasAnomaly: false, anomalies: [], message: 'Cần thêm dữ liệu trong tháng này để phân tích' }
    }

    const avgConsumption = readings.reduce((sum, r) => sum + r.consumption, 0) / readings.length
    const anomalies: any[] = []

    // Check all readings in current cycle
    readings.forEach(reading => {
      const deviation = ((reading.consumption - avgConsumption) / avgConsumption) * 100
      
      if (Math.abs(deviation) > 30 && reading.consumption > 0) {
        anomalies.push({
          date: reading.createdAt,
          consumption: reading.consumption,
          cost: reading.cost,
          deviation: deviation.toFixed(1),
          severity: Math.abs(deviation) > 50 ? 'high' : 'medium',
          message: deviation > 0 
            ? `Tiêu thụ tăng ${deviation.toFixed(0)}% bất thường`
            : `Tiêu thụ giảm ${Math.abs(deviation).toFixed(0)}% bất thường`
        })
      }
    })

    return {
      hasAnomaly: anomalies.length > 0,
      anomalies,
      avgConsumption: avgConsumption.toFixed(1),
      cycleStart: cycleStartDate
    }
  }

  // Generate savings tips
  static async generateSavingsTips(userId: string, roomId?: string) {
    const context = await this.getUserContext(userId)
    
    if (!context || context.statistics.readingCount < 2) {
      return {
        tips: [
          '💡 Sử dụng đèn LED thay vì đèn sợi đốt để tiết kiệm đến 80% điện năng',
          '❄️ Đặt nhiệt độ điều hòa ở 26°C, mỗi độ giảm tiết kiệm 5-10% điện',
          '🔌 Rút phích cắm các thiết bị không sử dụng',
          '🌞 Tận dụng ánh sáng tự nhiên ban ngày',
          '🧊 Không mở tủ lạnh quá lâu, kiểm tra gioăng cửa'
        ]
      }
    }

    const { statistics } = context
    const tips: string[] = []

    // Personalized tips based on consumption
    if (statistics.avgConsumption > 150) {
      tips.push('⚡ Tiêu thụ điện của bạn khá cao. Hãy kiểm tra các thiết bị điện lớn như điều hòa, tủ lạnh, máy nước nóng')
    }

    if (statistics.avgConsumption > 100) {
      tips.push('💡 Thay đổi thói quen: Tắt đèn khi ra khỏi phòng, rút phích cắm thiết bị không dùng')
    }

    tips.push('❄️ Điều hòa tiêu thụ nhiều điện nhất. Đặt 26°C và bật chế độ tiết kiệm năng lượng')
    tips.push('🌙 Sử dụng điện vào giờ thấp điểm (22h-6h) nếu có thể để tiết kiệm chi phí')
    tips.push('🔍 Kiểm tra định kỳ các thiết bị điện, thiết bị cũ tiêu thụ nhiều điện hơn')

    return { tips }
  }
}
