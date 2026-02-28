import { useState } from 'react'
import { TrendingUp, ArrowUp, Lightbulb, Wind, CheckCircle, AlertCircle, Award, Lock, TreeDeciduous, Gift, ChevronRight } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useQuery } from '@tanstack/react-query'
import { useAnalytics } from '@/hooks/useAnalytics'
import { useNavigate } from 'react-router-dom'
import { useRoomStore } from '@/stores/roomStore'
import { useAuthStore } from '@/stores/authStore'
import api from '@/lib/api'
import AIInsights from '@/components/AIInsights'
import SubscriptionWarning from '@/components/SubscriptionWarning'

export default function Dashboard() {
  const { dashboardStats, tips, isLoading } = useAnalytics()
  const { selectedRoom } = useRoomStore()
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [timePeriod, setTimePeriod] = useState<'7days' | '30days' | 'month'>('month')

  // Check subscription access - includes inheritance from landlord
  const { data: subscriptionAccess, isLoading: loadingAccess } = useQuery({
    queryKey: ['subscription-access'],
    queryFn: async () => {
      const response = await api.get('/subscriptions/access')
      return response.data
    }
  })

  // Fetch check-in status
  const { data: checkInData } = useQuery({
    queryKey: ['checkin-status'],
    queryFn: async () => {
      const response = await api.get('/checkin/status')
      return response.data
    }
  })

  // Check if user has analytics access (either own subscription or inherited from landlord)
  const hasAnalytics = subscriptionAccess?.canAccessAnalytics === true

  // Fetch chart data based on selected time period
  const { data: consumptionData } = useQuery({
    queryKey: ['dashboard-chart', timePeriod, selectedRoom?._id],
    queryFn: async () => {
      try {
        const params: any = { type: 'daily' }
        
        if (timePeriod === '7days') {
          params.limit = 7
        } else if (timePeriod === '30days') {
          params.limit = 30
        } else {
          // For 'month', use current month filter
          const now = new Date()
          params.month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
        }
        
        if (selectedRoom?._id) params.roomId = selectedRoom._id
        const response = await api.get('/analytics/consumption', { params })
        return response.data.data
      } catch (error: any) {
        if (error.response?.status === 403) {
          // User no longer has access to this room
          return []
        }
        throw error
      }
    },
    retry: false
  })

  if (isLoading || loadingAccess) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Đang tải dữ liệu...</div>
      </div>
    )
  }

  const monthlyConsumption = dashboardStats?.monthlyConsumption || 0
  const monthlyCost = dashboardStats?.monthlyCost || 0
  const dailyAverage = dashboardStats?.dailyAverage || 0
  const consumptionLevel = dashboardStats?.consumptionLevel || 'low'
  const lastReading = dashboardStats?.lastReading

  const levelText = {
    low: 'Thấp',
    medium: 'Trung bình',
    high: 'Cao'
  }

  const levelColor = {
    low: 'text-green-600',
    medium: 'text-yellow-600',
    high: 'text-orange-600'
  }

  // Get tree stage for check-in
  const getTreeStage = (streak: number) => {
    if (streak === 0) return { emoji: '🌱', name: 'Hạt giống', color: 'text-gray-400' }
    if (streak < 5) return { emoji: '🌱', name: 'Mầm non', color: 'text-green-400' }
    if (streak < 10) return { emoji: '🌿', name: 'Cây con', color: 'text-green-500' }
    if (streak < 15) return { emoji: '🌳', name: 'Cây nhỏ', color: 'text-green-600' }
    if (streak < 20) return { emoji: '🌲', name: 'Cây lớn', color: 'text-green-700' }
    if (streak < 25) return { emoji: '🌴', name: 'Cây to', color: 'text-green-800' }
    return { emoji: '🎄', name: 'Cây khổng lồ', color: 'text-green-900' }
  }

  const streak = checkInData?.streak || 0
  const treeStage = getTreeStage(streak)
  const checkInProgress = Math.min((streak / 25) * 100, 100)

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Subscription Warning Banner */}
      <SubscriptionWarning />

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-green-50 via-blue-50 to-green-50 rounded-lg sm:rounded-xl lg:rounded-2xl p-4 sm:p-6 lg:p-8 border border-green-200">
        <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-1 sm:mb-2">
          Chào mừng bạn đến với GreenEnergy AI!
        </h1>
        <p className="text-xs sm:text-sm lg:text-base text-gray-600">
          Kiểm soát lượng điện tiêu thụ của bạn để dùng và tiết kiệm hiệu quả.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Điện năng sử dụng hôm nay */}
        <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-5 lg:p-6 border border-gray-200 shadow-sm flex flex-col">
          <p className="text-xs sm:text-sm text-gray-600 mb-1">Trung bình mỗi ngày</p>
          <div className="flex items-baseline gap-1.5 sm:gap-2 mb-2">
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{dailyAverage.toFixed(1)}</p>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600">kWh</p>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500 mb-2 sm:mb-3">
            <span>Tháng này</span>
          </div>
          <div className="mt-auto h-2 bg-gradient-to-r from-green-400 to-green-600 rounded-full w-full"></div>
        </div>

        {/* Chi phí tháng này */}
        <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-5 lg:p-6 border border-gray-200 shadow-sm flex flex-col">
          <p className="text-xs sm:text-sm text-gray-600 mb-1">Chi phí tháng này</p>
          <div className="flex items-baseline gap-1 mb-2">
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{monthlyCost.toLocaleString('vi-VN')}</p>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600">đ</p>
          </div>
          <div className="h-5 mb-2 sm:mb-3"></div>
          <div className="mt-auto h-2 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full w-full"></div>
        </div>

        {/* Mức tiêu thụ hiện tại */}
        <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-5 lg:p-6 border border-gray-200 shadow-sm flex flex-col">
          <p className="text-xs sm:text-sm text-gray-600 mb-1">Mức tiêu thụ hiện tại</p>
          <div className="flex items-center gap-2 mb-2">
            <p className={`text-xl sm:text-2xl lg:text-3xl font-bold ${levelColor[consumptionLevel]}`}>
              {levelText[consumptionLevel]}
            </p>
            {consumptionLevel === 'high' && <ArrowUp className="text-orange-600" size={18} />}
          </div>
          <div className="h-5 mb-2 sm:mb-3"></div>
          <div className="mt-auto h-2 bg-gradient-to-r from-orange-400 to-red-500 rounded-full w-full"></div>
        </div>

        {/* Mục tiêu tháng */}
        <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-5 lg:p-6 border border-gray-200 shadow-sm flex flex-col">
          <p className="text-xs sm:text-sm text-gray-600 mb-1">Tiêu thụ tháng này</p>
          <div className="flex items-baseline gap-1.5 sm:gap-2 mb-2">
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary-600">{monthlyConsumption.toFixed(1)}</p>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600">kWh</p>
          </div>
          <div className="text-xs text-gray-500 mb-2 sm:mb-3">
            {dashboardStats?.totalReadings || 0} lần đọc
          </div>
          <div className="mt-auto h-2 bg-gray-200 rounded-full overflow-hidden w-full">
            <div className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full" style={{ width: '100%' }}></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Biểu Đồ Tiêu Thụ Điện */}
        <div className="lg:col-span-2 bg-white rounded-lg sm:rounded-xl p-4 sm:p-5 lg:p-6 border border-gray-200 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 mb-4">
            <h2 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900">Biểu Đồ Tiêu Thụ Điện</h2>
            {hasAnalytics && (
              <select 
                className="text-xs sm:text-sm border border-gray-300 rounded-lg px-2 sm:px-3 py-1.5 w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                value={timePeriod}
                onChange={(e) => setTimePeriod(e.target.value as '7days' | '30days' | 'month')}
              >
                <option value="7days">7 Ngày Qua</option>
                <option value="30days">30 Ngày Qua</option>
                <option value="month">Tháng này</option>
              </select>
            )}
          </div>
          
          {!hasAnalytics ? (
            <div className="h-48 sm:h-64 flex flex-col items-center justify-center text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-4">
              <Lock className="text-gray-400 mb-3" size={32} />
              <p className="text-sm sm:text-base lg:text-lg font-semibold text-gray-700 mb-2 text-center">Tính năng Premium</p>
              <p className="text-xs sm:text-sm text-gray-600 mb-4 text-center max-w-xs">Nâng cấp gói để xem biểu đồ phân tích</p>
              <button
                onClick={() => navigate('/bang-gia')}
                className="px-4 sm:px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-xs sm:text-sm font-medium"
              >
                Nâng cấp ngay
              </button>
            </div>
          ) : consumptionData && consumptionData.length > 0 ? (
            <div className="w-full overflow-x-auto -mx-2 sm:mx-0">
              <div className="min-w-[300px] px-2 sm:px-0">
                <ResponsiveContainer width="100%" height={240} minWidth={280}>
                  <AreaChart data={consumptionData}>
                    <defs>
                      <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" stroke="#9ca3af" style={{ fontSize: '11px' }} />
                    <YAxis stroke="#9ca3af" style={{ fontSize: '11px' }} />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="consumption" 
                      stroke="#22c55e" 
                      strokeWidth={2}
                      fill="url(#colorCurrent)" 
                      name="Tiêu thụ (kWh)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <div className="h-48 sm:h-64 flex items-center justify-center text-gray-500 text-xs sm:text-sm text-center px-4">
              Chưa có dữ liệu. Hãy nhập chỉ số điện để xem biểu đồ!
            </div>
          )}

          {/* Thông Báo Hôm Nay */}
          <div className="mt-4 sm:mt-6 space-y-2 sm:space-y-3">
            <h3 className="font-semibold text-gray-900 text-xs sm:text-sm lg:text-base">Thông Báo Hôm Nay</h3>
            {consumptionLevel === 'high' && (
              <div className="flex items-start gap-2 sm:gap-3 p-2.5 sm:p-3 bg-orange-50 rounded-lg border border-orange-200">
                <AlertCircle className="text-orange-600 flex-shrink-0 mt-0.5" size={16} />
                <p className="text-xs sm:text-sm text-gray-700">
                  Cảnh báo: Mức tiêu thụ điện đang cao hơn bình thường!
                </p>
              </div>
            )}
            {monthlyConsumption > 0 && (
              <div className="flex items-start gap-2 sm:gap-3 p-2.5 sm:p-3 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={16} />
                <p className="text-xs sm:text-sm text-gray-700">
                  Bạn đã ghi nhận {dashboardStats?.totalReadings || 0} lần đọc số điện tháng này!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-4 sm:space-y-6">
          {/* Check-in Card */}
          <div 
            onClick={() => navigate('/diem-danh')}
            className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg sm:rounded-xl p-4 sm:p-5 lg:p-6 border-2 border-green-200 shadow-sm cursor-pointer hover:shadow-lg transition-all transform hover:scale-105"
          >
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="text-xs sm:text-sm lg:text-base font-semibold text-gray-900 flex items-center gap-1.5 sm:gap-2">
                <TreeDeciduous className="text-green-600" size={16} />
                Điểm Danh Hàng Ngày
              </h3>
              <ChevronRight className="text-gray-400" size={16} />
            </div>
            
            <div className="text-center space-y-2 sm:space-y-3">
              {/* Tree Emoji */}
              <div className="text-4xl sm:text-5xl lg:text-6xl">
                {treeStage.emoji}
              </div>
              
              {/* Tree Stage */}
              <div>
                <p className={`text-base sm:text-lg lg:text-xl font-bold ${treeStage.color}`}>
                  {treeStage.name}
                </p>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  Chuỗi: <span className="font-bold text-green-600">{streak} ngày</span>
                </p>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-500"
                    style={{ width: `${checkInProgress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {streak}/25 ngày
                </p>
              </div>

              {/* Voucher Info */}
              {checkInData?.vouchers && checkInData.vouchers.length > 0 ? (
                <div className="flex items-center justify-center gap-1.5 sm:gap-2 text-purple-600 text-xs sm:text-sm font-semibold bg-purple-50 rounded-lg py-1.5 sm:py-2">
                  <Gift size={14} />
                  <span>{checkInData.vouchers.length} voucher</span>
                </div>
              ) : streak >= 25 ? (
                <div className="text-xs text-green-600 font-semibold">
                  🎉 Đạt mốc 25 ngày!
                </div>
              ) : (
                <div className="text-xs text-gray-500">
                  Còn {25 - streak} ngày để nhận voucher 50%
                </div>
              )}
            </div>
          </div>

          {/* Mẹo Tiết Kiệm Điện */}
          <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-5 lg:p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-3 sm:mb-4">
              <Lightbulb className="text-yellow-500" size={18} />
              <h3 className="text-xs sm:text-sm lg:text-base font-semibold text-gray-900">Mẹo Tiết Kiệm Điện</h3>
            </div>
            
            <div className="space-y-2 sm:space-y-3">
              {tips && tips.length > 0 ? (
                tips.slice(0, 3).map((tip: any) => (
                  <div key={tip.id} className="flex items-start gap-2 sm:gap-3 p-2.5 sm:p-3 bg-blue-50 rounded-lg">
                    <Lightbulb className="text-blue-600 flex-shrink-0 mt-0.5" size={14} />
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-gray-900">{tip.title}</p>
                      <p className="text-xs text-gray-600 mt-0.5 sm:mt-1">{tip.description}</p>
                      <span className="text-xs text-green-600 font-semibold mt-0.5 sm:mt-1 inline-block">
                        Tiết kiệm: {tip.savings}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs sm:text-sm text-gray-500">Chưa có mẹo tiết kiệm</p>
              )}
            </div>
          </div>

          {/* Thành Tích Của Bạn */}
          <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-5 lg:p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-3 sm:mb-4">
              <Award className="text-yellow-500" size={18} />
              <h3 className="text-xs sm:text-sm lg:text-base font-semibold text-gray-900">Thành Tích Của Bạn</h3>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mb-2 sm:mb-3">
                <Award className="text-white" size={32} />
              </div>
              <h4 className="font-bold text-sm sm:text-base lg:text-lg text-gray-900">Green Saver</h4>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                Hoàn thành {dashboardStats?.totalReadings || 0} lần ghi nhận chỉ số điện
              </p>
              <button 
                onClick={() => navigate('/thanh-tich')}
                className="mt-3 sm:mt-4 px-4 sm:px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-xs sm:text-sm font-medium w-full sm:w-auto"
              >
                Xem Thành Tích →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* AI Insights Section - Show for premium users */}
      {hasAnalytics && (
        <div>
          <h2 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 mb-3 sm:mb-4">
            🤖 Phân Tích AI {selectedRoom ? `- ${selectedRoom.name}` : ''}
          </h2>
          <AIInsights />
        </div>
      )}

      {/* Premium feature locked message */}
      {!hasAnalytics && (
        <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 lg:p-8 border border-gray-200 shadow-sm">
          <div className="text-center">
            <Lock className="mx-auto text-gray-400 mb-3" size={32} />
            <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 mb-2">
              Phân Tích AI - Tính năng Premium
            </h3>
            <p className="text-gray-600 text-xs sm:text-sm mb-4 max-w-md mx-auto">
              Nâng cấp gói để sử dụng AI trợ lý thông minh
            </p>
            <button
              onClick={() => navigate('/bang-gia')}
              className="px-4 sm:px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-xs sm:text-sm font-medium"
            >
              Nâng cấp ngay
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
