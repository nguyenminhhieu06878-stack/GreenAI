import { useEffect, useState } from 'react'
import { Check, X } from 'lucide-react'
import api from '@/lib/api'
import toast from 'react-hot-toast'

interface Plan {
  id: number
  name: string
  price: number
  duration: string
  features: string[]
  popular: boolean
  userCount: number
}

export default function AdminSubscriptions() {
  const [plans, setPlans] = useState<Plan[]>([
    // Tenant plans
    {
      id: 0,
      name: 'Gói Cơ Bản',
      price: 29000,
      duration: 'tháng',
      features: [
        '1 phòng',
        'Theo dõi tiêu thụ điện',
        'Lịch sử không giới hạn',
        'Chụp ảnh đồng hồ (OCR)',
        'Biểu đồ phân tích',
        '🤖 AI Chatbot',
        '🤖 AI phân tích tiêu thụ',
        '⚠️ Phát hiện bất thường'
      ],
      popular: false,
      userCount: 0
    },
    // Landlord plans
    {
      id: 1,
      name: 'Gói Starter',
      price: 99000,
      duration: 'tháng',
      features: [
        'Quản lý tối đa 5 phòng',
        'Theo dõi tiêu thụ điện từng phòng',
        'Quản lý người thuê',
        'Lịch sử chỉ số điện',
        'Chụp ảnh đồng hồ (OCR)',
        '🤖 AI Chatbot hỗ trợ'
      ],
      popular: false,
      userCount: 0
    },
    {
      id: 2,
      name: 'Gói Professional',
      price: 199000,
      duration: 'tháng',
      features: [
        'Quản lý tối đa 20 phòng',
        'Tất cả tính năng Starter',
        'Biểu đồ phân tích',
        '🤖 AI phân tích tiêu thụ',
        '⚠️ Phát hiện bất thường',
        'Báo cáo chi tiết'
      ],
      popular: true,
      userCount: 0
    },
    {
      id: 3,
      name: 'Gói Business',
      price: 299000,
      duration: 'tháng',
      features: [
        'Không giới hạn phòng',
        'Tất cả tính năng Professional',
        'Quản lý không giới hạn người thuê',
        'Xem tất cả lịch sử',
        '📄 Xuất hóa đơn PDF',
        '📄 Xuất báo cáo PDF',
        '💬 Chat trực tiếp với admin',
        'Hỗ trợ ưu tiên'
      ],
      popular: false,
      userCount: 0
    }
  ])

  const [subscriptions, setSubscriptions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const [paymentMethod, setPaymentMethod] = useState('Momo')
  const [users, setUsers] = useState<any[]>([])
  const [selectedUserId, setSelectedUserId] = useState('')

  useEffect(() => {
    fetchSubscriptions()
    fetchUsers()
  }, [])

  const fetchSubscriptions = async () => {
    try {
      const response = await api.get('/subscriptions/all')
      setSubscriptions(response.data.subscriptions)
      
      // Update user counts for each plan
      const updatedPlans = plans.map(plan => ({
        ...plan,
        userCount: response.data.subscriptions.filter(
          (s: any) => s.planName === plan.name && s.status === 'active'
        ).length
      }))
      
      setPlans(updatedPlans)
    } catch (error: any) {
      toast.error('Không thể tải dữ liệu gói dịch vụ')
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users')
      setUsers(response.data.users || [])
    } catch (error: any) {
      toast.error('Không thể tải danh sách người dùng')
    }
  }

  const handleBuyPlan = (plan: Plan) => {
    setSelectedPlan(plan)
    setShowModal(true)
  }

  const handleConfirmPurchase = async () => {
    if (!selectedPlan || !selectedUserId) {
      toast.error('Vui lòng chọn người dùng')
      return
    }

    try {
      await api.post('/admin/subscriptions/create', {
        userId: selectedUserId,
        planName: selectedPlan.name,
        planPrice: selectedPlan.price,
        duration: 1,
        paymentMethod
      })
      
      toast.success('Đã tạo gói dịch vụ thành công!')
      setShowModal(false)
      setSelectedPlan(null)
      setSelectedUserId('')
      fetchSubscriptions()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Không thể tạo gói dịch vụ')
    }
  }

  const totalRevenue = subscriptions
    .filter(s => s.status === 'active')
    .reduce((sum, s) => sum + s.planPrice, 0)
  
  const totalUsers = subscriptions.filter(s => s.status === 'active').length

  if (loading) return <div className="flex items-center justify-center h-64">Đang tải...</div>

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold">Quản Lý Gói Dịch Vụ</h2>
      </div>

      {/* Stats */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        <div className="bg-white rounded-lg p-4 sm:p-6 border border-gray-200">
          <p className="text-xs sm:text-sm font-medium text-gray-600">Tổng Doanh Thu/Tháng</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-2">
            {totalRevenue.toLocaleString('vi-VN')} đ
          </p>
        </div>
        <div className="bg-white rounded-lg p-4 sm:p-6 border border-gray-200">
          <p className="text-xs sm:text-sm font-medium text-gray-600">Tổng Người Dùng Trả Phí</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-2">{totalUsers}</p>
        </div>
        <div className="bg-white rounded-lg p-4 sm:p-6 border border-gray-200 sm:col-span-2 md:col-span-1">
          <p className="text-xs sm:text-sm font-medium text-gray-600">Số Gói Đang Bán</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-2">{plans.length}</p>
          <p className="text-[10px] sm:text-xs text-gray-500 mt-1">1 gói người thuê + 3 gói chủ trọ</p>
        </div>
      </div>

      {/* Plans */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`bg-white rounded-lg p-4 sm:p-6 border-2 flex flex-col ${
              plan.popular ? 'border-emerald-500 shadow-lg' : 'border-gray-200'
            }`}
          >
            {plan.popular && (
              <span className="inline-block px-3 py-1 bg-emerald-500 text-white text-xs font-semibold rounded-full mb-3 sm:mb-4 w-fit">
                Phổ Biến Nhất
              </span>
            )}
            <h3 className="text-lg sm:text-xl font-bold text-gray-900">{plan.name}</h3>
            <div className="mt-3 sm:mt-4 flex items-baseline">
              <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                {plan.price.toLocaleString('vi-VN')}đ
              </span>
              <span className="ml-2 text-sm sm:text-base text-gray-500">/{plan.duration}</span>
            </div>
            <div className="mt-2 text-xs sm:text-sm text-gray-600">
              {plan.userCount} người dùng đang sử dụng
            </div>
            <ul className="mt-4 sm:mt-6 space-y-2 sm:space-y-3 flex-grow">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Check size={18} className="text-green-500 flex-shrink-0 mt-0.5 sm:w-5 sm:h-5" />
                  <span className="text-xs sm:text-sm text-gray-600">{feature}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 sm:mt-6">
              <button 
                onClick={() => handleBuyPlan(plan)}
                className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-xs sm:text-sm font-medium transition-colors"
              >
                Tạo Gói Cho Người Dùng
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && selectedPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg sm:text-xl font-bold">Xác Nhận Tạo Gói</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <X size={20} className="sm:w-6 sm:h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Gói dịch vụ</p>
                <p className="text-base sm:text-lg font-semibold">{selectedPlan.name}</p>
              </div>
              
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Giá</p>
                <p className="text-base sm:text-lg font-semibold">{selectedPlan.price.toLocaleString('vi-VN')} đ/{selectedPlan.duration}</p>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Chọn người dùng
                </label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">-- Chọn người dùng --</option>
                  {users.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.name} ({user.email}) - {user.role === 'tenant' ? 'Người thuê' : 'Chủ trọ'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Phương thức thanh toán
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Momo">Momo</option>
                  <option value="VNPay">VNPay</option>
                  <option value="Chuyển khoản">Chuyển khoản</option>
                  <option value="Tiền mặt">Tiền mặt</option>
                </select>
              </div>

              <div className="flex gap-2 sm:gap-3 mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleConfirmPurchase}
                  className="flex-1 px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                >
                  Xác Nhận
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
