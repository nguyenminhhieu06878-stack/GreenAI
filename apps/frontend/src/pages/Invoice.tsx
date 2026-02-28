import { useState, useEffect } from 'react'
import { FileText, Calendar, Zap, DollarSign, TrendingUp, Download, Lock } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/authStore'
import { useRoomStore } from '@/stores/roomStore'
import { useNavigate } from 'react-router-dom'
import api from '@/lib/api'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import toast from 'react-hot-toast'

export default function Invoice() {
  const { user } = useAuthStore()
  const { selectedRoom } = useRoomStore()
  const navigate = useNavigate()
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })
  const [billingPeriod, setBillingPeriod] = useState({ start: '', end: '' })
  const [canExportPDF, setCanExportPDF] = useState<boolean | null>(null)

  // Check PDF export permission
  useEffect(() => {
    const checkPDFAccess = async () => {
      try {
        const response = await api.get('/subscriptions/check-pdf-access')
        setCanExportPDF(response.data.allowed)
      } catch (error) {
        setCanExportPDF(false)
      }
    }
    checkPDFAccess()
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

  // Fetch room data to get latest electricity rate
  const { data: roomData } = useQuery({
    queryKey: ['room-detail', selectedRoom?._id],
    queryFn: async () => {
      if (!selectedRoom?._id) return null
      const response = await api.get(`/rooms/${selectedRoom._id}`)
      return response.data.room
    },
    enabled: !!selectedRoom?._id
  })

  // Fetch invoice data for selected month
  const { data: invoiceData, isLoading } = useQuery({
    queryKey: ['invoice', selectedMonth, selectedRoom?._id],
    queryFn: async () => {
      const params: any = { month: selectedMonth }
      if (selectedRoom?._id) params.roomId = selectedRoom._id
      const response = await api.get('/analytics/invoice', { params })
      return response.data
    }
  })

  useEffect(() => {
    calculateBillingPeriod()
  }, [user, selectedMonth])

  const calculateBillingPeriod = () => {
    if (!selectedMonth) return
    
    const [year, month] = selectedMonth.split('-').map(Number)
    const billingDay = user?.billingDate || 1
    
    const startDate = new Date(year, month - 1, billingDay)
    const endDate = new Date(year, month, billingDay)
    
    setBillingPeriod({
      start: startDate.toLocaleDateString('vi-VN'),
      end: endDate.toLocaleDateString('vi-VN')
    })
  }

  const handleExportPDF = async () => {
    if (!canExportPDF) {
      toast.error('Tính năng xuất PDF chỉ khả dụng từ gói Business (299k) trở lên')
      navigate('/bang-gia')
      return
    }

    try {
      const doc = new jsPDF()
      
      // Title
      doc.setFontSize(20)
      doc.text('HOA DON TIEN DIEN', 105, 20, { align: 'center' })
      
      // Billing period
      doc.setFontSize(12)
      doc.text(`Chu ky thanh toan: ${billingPeriod.start} - ${billingPeriod.end}`, 20, 35)
      
      if (selectedRoom) {
        doc.text(`Phong: ${roomData?.name || selectedRoom.name}`, 20, 42)
        doc.text(`Gia dien: ${electricityRate.toLocaleString('vi-VN')} VND/kWh`, 20, 49)
      }
      
      // Summary
      doc.setFontSize(14)
      doc.text(`Tong tieu thu: ${monthlyConsumption.toFixed(1)} kWh`, 20, 62)
      doc.text(`Don gia: ${electricityRate.toLocaleString('vi-VN')} VND/kWh`, 20, 72)
      doc.text(`Tong tien: ${monthlyCost.toLocaleString('vi-VN')} VND`, 20, 82)
      
      // Details table
      const consumptionText = `${monthlyConsumption.toFixed(1)} kWh`
      const rateText = `${electricityRate.toLocaleString('vi-VN')} VND`
      const costText = `${monthlyCost.toLocaleString('vi-VN')} VND`
      
      const tableData = [
        ['Tieu thu dien', consumptionText, rateText, costText]
      ]
      
      autoTable(doc, {
        startY: 95,
        head: [['Mo ta', 'So luong', 'Don gia', 'Thanh tien']],
        body: tableData,
        foot: [['', '', 'Tong cong:', costText]],
        theme: 'grid',
        headStyles: { fillColor: [34, 197, 94] },
        footStyles: { fillColor: [243, 244, 246], textColor: [0, 0, 0], fontStyle: 'bold' }
      })
      
      // Save PDF
      const fileName = `hoa-don-${selectedMonth}${selectedRoom ? `-${selectedRoom.name}` : ''}.pdf`
      doc.save(fileName)
      
      toast.success('Đã xuất PDF thành công!')
    } catch (error) {
      console.error('Export PDF error:', error)
      toast.error('Không thể xuất PDF')
    }
  }

  const monthlyConsumption = invoiceData?.consumption || 0
  const monthlyCost = invoiceData?.cost || 0
  const monthlyGoal = user?.monthlyGoal || 0
  // Use latest room data if available, otherwise fall back to cached room or user settings
  const electricityRate = roomData?.electricityRate || selectedRoom?.electricityRate || user?.electricityRate || 3000

  const goalProgress = monthlyGoal > 0 ? (monthlyConsumption / monthlyGoal) * 100 : 0
  const isOverGoal = goalProgress > 100

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Đang tải dữ liệu...</div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
        <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Hóa Đơn Tiền Điện</h1>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
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
          <button 
            onClick={handleExportPDF}
            disabled={canExportPDF === false}
            className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              canExportPDF === false 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-emerald-600 text-white hover:bg-emerald-700'
            }`}
            title={canExportPDF === false ? 'Chỉ gói Business mới có tính năng này' : 'Xuất PDF'}
          >
            {canExportPDF === false ? <Lock size={16} /> : <Download size={16} />}
            <span>Xuất PDF</span>
          </button>
        </div>
      </div>

      {/* Thông tin chu kỳ */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-lg sm:rounded-xl p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 text-gray-600 mb-2">
              <Calendar size={18} className="sm:w-5 sm:h-5" />
              <span className="text-xs sm:text-sm font-medium">Chu kỳ thanh toán</span>
            </div>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
              {billingPeriod.start} - {billingPeriod.end}
            </p>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-xs sm:text-sm text-gray-600 mb-1">Tổng tiền phải trả</p>
            <p className="text-2xl sm:text-3xl font-bold text-emerald-600">
              {monthlyCost.toLocaleString('vi-VN')}đ
            </p>
          </div>
        </div>
      </div>

      {/* Thống kê tổng quan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
              <Zap className="text-blue-600" size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-gray-600">Tổng tiêu thụ</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 truncate">{monthlyConsumption.toFixed(1)} kWh</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
              <DollarSign className="text-green-600" size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-gray-600">Giá trung bình</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                {monthlyConsumption > 0 ? Math.round(monthlyCost / monthlyConsumption).toLocaleString('vi-VN') : 0} đ/kWh
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 border border-gray-200 shadow-sm sm:col-span-2 md:col-span-1">
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg flex-shrink-0 ${isOverGoal ? 'bg-red-100' : 'bg-green-100'}`}>
              <TrendingUp className={isOverGoal ? 'text-red-600' : 'text-green-600'} size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-gray-600">So với mục tiêu</p>
              <p className={`text-xl sm:text-2xl font-bold truncate ${isOverGoal ? 'text-red-600' : 'text-green-600'}`}>
                {monthlyGoal > 0 ? `${goalProgress.toFixed(0)}%` : 'Chưa đặt'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Chi tiết hóa đơn */}
      <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 border border-gray-200 shadow-sm">
        <h2 className="text-sm sm:text-base lg:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
          <FileText size={18} className="sm:w-5 sm:h-5" />
          <span>Chi Tiết Hóa Đơn</span>
        </h2>
        
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <div className="min-w-[500px] px-4 sm:px-0">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 sm:px-4 py-2.5 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-700">Mô tả</th>
                  <th className="px-3 sm:px-4 py-2.5 sm:py-3 text-right text-xs sm:text-sm font-medium text-gray-700">Số lượng</th>
                  <th className="px-3 sm:px-4 py-2.5 sm:py-3 text-right text-xs sm:text-sm font-medium text-gray-700">Đơn giá</th>
                  <th className="px-3 sm:px-4 py-2.5 sm:py-3 text-right text-xs sm:text-sm font-medium text-gray-700">Thành tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr className="hover:bg-gray-50">
                  <td className="px-3 sm:px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Zap className="text-emerald-600 flex-shrink-0" size={18} />
                      <span className="text-xs sm:text-sm font-medium">Tiêu thụ điện</span>
                    </div>
                  </td>
                  <td className="px-3 sm:px-4 py-3 text-right text-xs sm:text-sm font-medium whitespace-nowrap">
                    {monthlyConsumption.toFixed(1)} kWh
                  </td>
                  <td className="px-3 sm:px-4 py-3 text-right text-xs sm:text-sm whitespace-nowrap">
                    {electricityRate.toLocaleString('vi-VN')} đ/kWh
                  </td>
                  <td className="px-3 sm:px-4 py-3 text-right text-xs sm:text-sm font-bold text-emerald-600 whitespace-nowrap">
                    {monthlyCost.toLocaleString('vi-VN')} đ
                  </td>
                </tr>
                <tr className="bg-gray-50 font-bold">
                  <td colSpan={3} className="px-3 sm:px-4 py-3 text-right text-xs sm:text-sm">Tổng cộng:</td>
                  <td className="px-3 sm:px-4 py-3 text-right text-emerald-600 text-sm sm:text-base lg:text-lg whitespace-nowrap">
                    {monthlyCost.toLocaleString('vi-VN')} đ
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {selectedRoom && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs sm:text-sm text-gray-700">
              <strong>Phòng:</strong> {roomData?.name || selectedRoom.name} | 
              <strong className="ml-2">Giá điện:</strong> {electricityRate.toLocaleString('vi-VN')} đ/kWh
            </p>
          </div>
        )}
      </div>

      {/* Mục tiêu tiết kiệm */}
      {monthlyGoal > 0 && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg sm:rounded-xl p-4 sm:p-6">
          <h3 className="text-sm sm:text-base font-semibold mb-3">Mục Tiêu Tiết Kiệm</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-xs sm:text-sm">
              <span>Mục tiêu: {monthlyGoal} kWh</span>
              <span>Thực tế: {monthlyConsumption.toFixed(1)} kWh</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 sm:h-4 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all ${isOverGoal ? 'bg-red-500' : 'bg-green-500'}`}
                style={{ width: `${Math.min(goalProgress, 100)}%` }}
              ></div>
            </div>
            <p className="text-xs sm:text-sm text-gray-600">
              {isOverGoal 
                ? `Vượt mục tiêu ${(monthlyConsumption - monthlyGoal).toFixed(1)} kWh` 
                : `Còn ${(monthlyGoal - monthlyConsumption).toFixed(1)} kWh để đạt mục tiêu`
              }
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
