import { useState, useEffect } from 'react'
import { Save, Calendar, Target, CreditCard, CheckCircle } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import SubscriptionWarning from '@/components/SubscriptionWarning'

export default function Settings() {
  const { user, updateUser } = useAuthStore()
  const [billingDate, setBillingDate] = useState(1)
  const [monthlyGoal, setMonthlyGoal] = useState(0)
  const [electricityRate, setElectricityRate] = useState(3000)
  const [loading, setLoading] = useState(false)
  const [subscriptions, setSubscriptions] = useState<any[]>([])
  const [loadingSubscriptions, setLoadingSubscriptions] = useState(true)
  const [showHistory, setShowHistory] = useState(false)

  useEffect(() => {
    fetchSettings()
    fetchSubscriptions()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await api.get('/auth/profile')
      setBillingDate(response.data.billingDate || 1)
      setMonthlyGoal(response.data.monthlyGoal || 0)
      setElectricityRate(response.data.electricityRate || 3000)
    } catch (error) {
      console.error('Failed to fetch settings:', error)
      toast.error('Không thể tải cài đặt')
    }
  }

  const fetchSubscriptions = async () => {
    try {
      const response = await api.get('/subscriptions/my')
      setSubscriptions(response.data.subscriptions)
    } catch (error) {
      console.error('Failed to fetch subscriptions:', error)
    } finally {
      setLoadingSubscriptions(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await api.put('/auth/profile', {
        billingDate,
        monthlyGoal,
        electricityRate
      })
      updateUser({ billingDate, monthlyGoal, electricityRate })
      toast.success('Đã lưu cài đặt thành công!')
    } catch (error) {
      toast.error('Không thể lưu cài đặt')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-700',
      expired: 'bg-gray-100 text-gray-700',
      cancelled: 'bg-red-100 text-red-700'
    }
    const names = {
      active: 'Đang hoạt động',
      expired: 'Hết hạn',
      cancelled: 'Đã hủy'
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[status as keyof typeof styles]}`}>
        {names[status as keyof typeof names]}
      </span>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Cài Đặt</h1>

      {/* Subscription Warning */}
      <SubscriptionWarning />

      {/* Subscription Info */}
      <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 border border-gray-200 shadow-sm">
        <h2 className="text-sm sm:text-base lg:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
          <CreditCard size={16} className="sm:w-[18px] sm:h-[18px]" />
          <span>Gói Dịch Vụ Của Tôi</span>
        </h2>
        
        {loadingSubscriptions ? (
          <p className="text-gray-500 text-sm">Đang tải...</p>
        ) : subscriptions.length === 0 ? (
          <div className="text-center py-6 sm:py-8">
            <p className="text-gray-500 mb-3 sm:mb-4 text-xs sm:text-sm">Bạn chưa đăng ký gói nào</p>
            <a 
              href="/bang-gia" 
              className="inline-block px-4 sm:px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-xs sm:text-sm font-medium"
            >
              Xem Bảng Giá
            </a>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {/* Active Subscription */}
            {subscriptions.filter(sub => sub.status === 'active').map((sub) => (
              <div key={sub._id} className="border-2 border-green-200 bg-green-50 rounded-lg p-3 sm:p-4">
                <div className="flex items-start justify-between mb-2 sm:mb-3 gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm sm:text-base lg:text-lg truncate">{sub.planName}</h3>
                    <p className="text-xs sm:text-sm text-gray-600">
                      {sub.planPrice.toLocaleString('vi-VN')} đ/tháng
                    </p>
                  </div>
                  {getStatusBadge(sub.status)}
                </div>
                
                <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-3 sm:mt-4 text-xs sm:text-sm">
                  <div>
                    <p className="text-gray-600 mb-0.5">Ngày bắt đầu</p>
                    <p className="font-medium">{new Date(sub.startDate).toLocaleDateString('vi-VN')}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-0.5">Ngày hết hạn</p>
                    <p className="font-medium">{new Date(sub.endDate).toLocaleDateString('vi-VN')}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-0.5">Phương thức</p>
                    <p className="font-medium truncate">{sub.paymentMethod}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-0.5">Mã giao dịch</p>
                    <p className="font-medium text-[10px] sm:text-xs truncate">{sub.transactionId}</p>
                  </div>
                </div>

                <div className="mt-3 sm:mt-4 flex items-center gap-1.5 sm:gap-2 text-green-600 text-xs sm:text-sm">
                  <CheckCircle size={14} className="sm:w-4 sm:h-4 flex-shrink-0" />
                  <span>Gói đang hoạt động</span>
                </div>
              </div>
            ))}

            {/* History Toggle Button */}
            {subscriptions.filter(sub => sub.status !== 'active').length > 0 && (
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="w-full text-xs sm:text-sm text-gray-600 hover:text-gray-900 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                {showHistory ? '▲ Ẩn lịch sử đăng ký' : '▼ Xem lịch sử đăng ký'}
              </button>
            )}

            {/* History */}
            {showHistory && (
              <div className="space-y-3 pt-2">
                <h3 className="text-xs sm:text-sm font-semibold text-gray-700">Lịch sử đăng ký</h3>
                {subscriptions.filter(sub => sub.status !== 'active').map((sub) => (
                  <div key={sub._id} className="border border-gray-200 rounded-lg p-3 sm:p-4 bg-gray-50">
                    <div className="flex items-start justify-between mb-2 sm:mb-3 gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm sm:text-base truncate">{sub.planName}</h3>
                        <p className="text-xs sm:text-sm text-gray-600">
                          {sub.planPrice.toLocaleString('vi-VN')} đ/tháng
                        </p>
                      </div>
                      {getStatusBadge(sub.status)}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-3 sm:mt-4 text-xs sm:text-sm">
                      <div>
                        <p className="text-gray-600 mb-0.5">Ngày bắt đầu</p>
                        <p className="font-medium">{new Date(sub.startDate).toLocaleDateString('vi-VN')}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 mb-0.5">Ngày hết hạn</p>
                        <p className="font-medium">{new Date(sub.endDate).toLocaleDateString('vi-VN')}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 mb-0.5">Phương thức</p>
                        <p className="font-medium truncate">{sub.paymentMethod}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 mb-0.5">Mã giao dịch</p>
                        <p className="font-medium text-[10px] sm:text-xs truncate">{sub.transactionId}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Settings Form */}
      <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 border border-gray-200 shadow-sm">
        <h2 className="text-sm sm:text-base lg:text-lg font-semibold mb-3 sm:mb-4">Chu Kỳ Thanh Toán</h2>
        
        <form onSubmit={handleSave} className="space-y-4 sm:space-y-6">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
              <Calendar size={16} className="inline mr-1.5 sm:mr-2 sm:w-[18px] sm:h-[18px]" />
              <span>Ngày thanh toán tiền điện hàng tháng</span>
            </label>
            <select
              value={billingDate}
              onChange={(e) => setBillingDate(Number(e.target.value))}
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-xs sm:text-sm"
            >
              {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                <option key={day} value={day}>Ngày {day}</option>
              ))}
            </select>
            <p className="text-xs sm:text-sm text-gray-500 mt-1.5 sm:mt-2">
              Chọn ngày bạn thường thanh toán tiền điện. Hệ thống sẽ tính tiêu thụ theo chu kỳ này.
            </p>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
              <Target size={16} className="inline mr-1.5 sm:mr-2 sm:w-[18px] sm:h-[18px]" />
              <span>Mục tiêu tiêu thụ hàng tháng (kWh)</span>
            </label>
            <input
              type="number"
              step="0.1"
              value={monthlyGoal}
              onChange={(e) => setMonthlyGoal(Number(e.target.value))}
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-xs sm:text-sm"
              placeholder="Ví dụ: 150"
            />
            <p className="text-xs sm:text-sm text-gray-500 mt-1.5 sm:mt-2">
              Đặt mục tiêu tiêu thụ điện để theo dõi và tiết kiệm hiệu quả hơn.
            </p>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
              💰 Giá điện (VNĐ/kWh)
            </label>
            <input
              type="number"
              step="100"
              value={electricityRate}
              onChange={(e) => setElectricityRate(Number(e.target.value))}
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-xs sm:text-sm"
              placeholder="Ví dụ: 3000"
            />
            <p className="text-xs sm:text-sm text-gray-500 mt-1.5 sm:mt-2">
              Nhập giá điện của bạn. Hệ thống sẽ tính tiền điện theo giá này. Mặc định: 3,000 VNĐ/kWh
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-xs sm:text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Save size={16} className="sm:w-[18px] sm:h-[18px]" />
            <span>{loading ? 'Đang lưu...' : 'Lưu cài đặt'}</span>
          </button>
        </form>
      </div>

      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg sm:rounded-xl p-4 sm:p-6">
        <h3 className="font-semibold mb-2 sm:mb-3 text-xs sm:text-sm lg:text-base">💡 Cách hoạt động</h3>
        <ul className="text-xs sm:text-sm text-gray-700 space-y-1.5 sm:space-y-2">
          <li>• Lần chụp đầu tiên vào ngày thanh toán sẽ là mốc bắt đầu (số 0)</li>
          <li>• Tháng sau cùng ngày, chụp lại để tính tiêu thụ của chu kỳ</li>
          <li>• Chụp bất kỳ lúc nào để xem tiêu thụ từ đầu chu kỳ đến giờ</li>
          <li>• Hệ thống tự động tạo hóa đơn khi đến chu kỳ mới</li>
        </ul>
      </div>
    </div>
  )
}
