import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Calendar, Lock } from 'lucide-react'
import { useAnalytics } from '@/hooks/useAnalytics'
import { useRoomStore } from '@/stores/roomStore'
import { useAuthStore } from '@/stores/authStore'
import { useNavigate } from 'react-router-dom'
import api from '@/lib/api'

export default function EnergyConsumption() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [canAccessAnalytics, setCanAccessAnalytics] = useState<boolean | null>(null)
  const [viewType, setViewType] = useState<'day' | 'month'>('day')
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })
  const { dashboardStats, isLoading } = useAnalytics()
  const { selectedRoom } = useRoomStore()

  // Check analytics access on mount
  useEffect(() => {
    const checkAccess = async () => {
      try {
        const response = await api.get('/analytics/check-access')
        setCanAccessAnalytics(response.data.allowed)
      } catch (error: any) {
        setCanAccessAnalytics(false)
      }
    }
    checkAccess()
  }, [])

  // Generate month options (last 12 months)
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const date = new Date()
    date.setMonth(date.getMonth() - i)
    return {
      value: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
      label: `Tháng ${date.getMonth() + 1}, ${date.getFullYear()}`
    }
  })

  // Fetch data based on view type
  const { data: chartDataRaw, isLoading: loadingChart } = useQuery({
    queryKey: ['consumption-chart-detailed', viewType, selectedMonth, selectedRoom?._id],
    queryFn: async () => {
      const params: any = { 
        type: viewType === 'day' ? 'daily' : 'monthly',
        limit: viewType === 'day' ? 30 : 3  // 3 months for monthly view
      }
      
      // Only filter by month for daily view
      if (viewType === 'day') {
        params.month = selectedMonth
      }
      
      if (selectedRoom?._id) params.roomId = selectedRoom._id
      const response = await api.get('/analytics/consumption', { params })
      return response.data.data
    }
  })

  // Show loading while checking access
  if (canAccessAnalytics === null) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Đang kiểm tra quyền truy cập...</div>
      </div>
    )
  }

  // Show upgrade message if no access
  if (!canAccessAnalytics) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Biểu Đồ Tiêu Thụ Điện Năng</h1>
        
        <div className="card bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200">
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-100 rounded-full mb-6">
              <Lock className="text-orange-600" size={40} />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Tính Năng Phân Tích Nâng Cao
            </h2>
            
            <p className="text-gray-700 mb-2 max-w-md mx-auto">
              Tính năng biểu đồ phân tích chi tiết chỉ khả dụng từ <span className="font-semibold text-orange-600">Gói Professional (199k)</span> trở lên.
            </p>
            
            <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
              Nâng cấp ngay để xem biểu đồ tiêu thụ theo ngày/tháng, phân tích xu hướng và tối ưu hóa chi phí điện năng!
            </p>

            <div className="flex gap-3 justify-center">
              <button
                onClick={() => navigate('/bang-gia')}
                className="btn btn-primary px-8"
              >
                Nâng Cấp Ngay
              </button>
              <button
                onClick={() => navigate('/trang-chu')}
                className="btn btn-secondary"
              >
                Quay Lại Dashboard
              </button>
            </div>

            <div className="mt-8 pt-6 border-t border-orange-200">
              <p className="text-sm font-semibold text-gray-700 mb-3">
                Gói Professional bao gồm:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 max-w-lg mx-auto">
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Biểu đồ chi tiết theo ngày/tháng</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Phân tích xu hướng tiêu thụ</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Quản lý tối đa 20 phòng</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>OCR + AI không giới hạn</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading || loadingChart) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Đang tải dữ liệu...</div>
      </div>
    )
  }

  const monthlyConsumption = dashboardStats?.monthlyConsumption || 0
  const monthlyCost = dashboardStats?.monthlyCost || 0
  const dailyAverage = dashboardStats?.dailyAverage || 0

  // Format chart data based on view type
  const chartData = viewType === 'day' 
    ? (chartDataRaw?.map((item: any) => ({
        date: item.date,
        value: item.consumption,
        cost: item.cost || 0
      })) || [])
    : (chartDataRaw?.map((item: any) => ({
        date: item.month,
        value: item.consumption,
        cost: item.cost || 0
      })) || [])

  // Calculate stats based on selected month/view
  const totalConsumption = chartData.reduce((sum, item) => sum + item.value, 0)
  const totalCost = chartData.reduce((sum, item) => sum + item.cost, 0)
  
  // Calculate averages based on view type
  let avgDaily = 0
  let avgCost = 0
  let avgLabel = 'Mỗi ngày'
  
  if (viewType === 'day') {
    // For daily view: calculate number of days in the billing cycle
    if (selectedMonth) {
      const [year, monthNum] = selectedMonth.split('-').map(Number)
      const startDate = new Date(year, monthNum - 1, 1)
      const endDate = new Date(year, monthNum, 1)
      const daysInCycle = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
      avgDaily = daysInCycle > 0 ? totalConsumption / daysInCycle : 0
      avgCost = daysInCycle > 0 ? totalCost / daysInCycle : 0
    }
  } else {
    // For monthly view: average per month
    avgDaily = chartData.length > 0 ? totalConsumption / chartData.length : 0
    avgCost = chartData.length > 0 ? totalCost / chartData.length : 0
    avgLabel = 'Mỗi tháng'
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
        <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Biểu Đồ Tiêu Thụ Điện Năng</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setViewType('day')}
            className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
              viewType === 'day' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Theo Ngày
          </button>
          <button
            onClick={() => setViewType('month')}
            className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
              viewType === 'month' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Theo Tháng
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 border border-gray-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 mb-4">
          <h2 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900">
            {viewType === 'day' ? 'Biểu Đồ Tiêu Thụ Theo Ngày' : 'Biểu Đồ Tiêu Thụ Theo Tháng'}
          </h2>
          {viewType === 'day' && (
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-gray-500 flex-shrink-0 sm:w-5 sm:h-5" />
              <select 
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="flex-1 sm:flex-none border border-gray-300 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                {monthOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}
          {viewType === 'month' && (
            <div className="text-xs sm:text-sm text-gray-600">
              Hiển thị 3 tháng gần nhất
            </div>
          )}
        </div>
        
        {chartData.length > 0 ? (
          <div className="w-full overflow-x-auto -mx-2 sm:mx-0">
            <div className="min-w-[320px] px-2 sm:px-0">
              <ResponsiveContainer width="100%" height={300} minWidth={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="date" 
                    label={{ 
                      value: viewType === 'day' ? 'Ngày' : 'Tháng', 
                      position: 'insideBottom', 
                      offset: -5,
                      style: { fontSize: '11px' }
                    }}
                    style={{ fontSize: '10px' }}
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis 
                    yAxisId="left" 
                    label={{ 
                      value: 'Tiêu thụ (kWh)', 
                      angle: -90, 
                      position: 'insideLeft',
                      style: { fontSize: '11px' }
                    }}
                    domain={[0, 'auto']}
                    style={{ fontSize: '10px' }}
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right"
                    label={{ 
                      value: 'Chi phí (đ)', 
                      angle: 90, 
                      position: 'insideRight',
                      style: { fontSize: '11px' }
                    }}
                    domain={[0, 'auto']}
                    style={{ fontSize: '10px' }}
                    tick={{ fontSize: 10 }}
                  />
                  <Tooltip 
                    formatter={(value: number, name: string) => {
                      if (name === 'Chi phí (đ)') {
                        return [value.toLocaleString('vi-VN') + ' đ', name]
                      }
                      return [value.toFixed(1) + ' kWh', name]
                    }}
                    contentStyle={{ 
                      fontSize: '12px',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    cursor={{ stroke: '#d1d5db', strokeWidth: 1 }}
                    allowEscapeViewBox={{ x: false, y: true }}
                  />
                  <Legend 
                    wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                    iconType="circle"
                  />
                  <Line 
                    yAxisId="left" 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#22c55e" 
                    strokeWidth={2} 
                    name="Tiêu thụ (kWh)"
                    dot={{ r: 4, fill: '#22c55e', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 8, fill: '#22c55e', strokeWidth: 3, stroke: '#fff' }}
                  />
                  <Line 
                    yAxisId="right" 
                    type="monotone" 
                    dataKey="cost" 
                    stroke="#3b82f6" 
                    strokeWidth={2} 
                    name="Chi phí (đ)"
                    dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 8, fill: '#3b82f6', strokeWidth: 3, stroke: '#fff' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="h-64 sm:h-96 flex items-center justify-center text-gray-500 text-xs sm:text-sm text-center px-4">
            Chưa có dữ liệu. Hãy nhập chỉ số điện để xem biểu đồ!
          </div>
        )}

        {/* Data Summary */}
        <div className="mt-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
          <p className="text-xs sm:text-sm text-gray-600">
            {viewType === 'day' 
              ? `Hiển thị ${chartData.length} ngày trong tháng ${monthOptions.find(m => m.value === selectedMonth)?.label}` 
              : `Hiển thị ${chartData.length} tháng gần nhất`
            }
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
        <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 border border-gray-200 shadow-sm">
          <p className="text-xs sm:text-sm text-gray-600">Tiêu thụ trung bình</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{avgDaily.toFixed(1)} kWh</p>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">{avgLabel}</p>
        </div>

        <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 border border-gray-200 shadow-sm">
          <p className="text-xs sm:text-sm text-gray-600">Chi phí trung bình</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{Number(avgCost.toFixed(0)).toLocaleString('vi-VN')}đ</p>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">{avgLabel}</p>
        </div>

        <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 border border-gray-200 shadow-sm sm:col-span-2 lg:col-span-1">
          <p className="text-xs sm:text-sm text-gray-600">Tổng tiêu thụ {viewType === 'day' ? 'tháng này' : 'các tháng'}</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{totalConsumption.toFixed(1)} kWh</p>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">Chi phí: {totalCost.toLocaleString('vi-VN')}đ</p>
        </div>
      </div>
    </div>
  )
}
