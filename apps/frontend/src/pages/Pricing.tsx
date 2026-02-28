import { useState, useEffect } from 'react'
import { Check, X } from 'lucide-react'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/stores/authStore'

// Tenant plans
const tenantPlans = [
  {
    name: 'Gói Miễn Phí',
    price: 0,
    duration: 'tháng',
    features: [
      'Xem lịch sử 3 tháng gần nhất',
      'Nhập chỉ số thủ công',
      'Xem hóa đơn cơ bản'
    ],
    limitations: [
      'Không có OCR tự động',
      'Không có biểu đồ phân tích',
      'Không có AI trợ lý'
    ],
    highlighted: false,
    type: 'tenant'
  },
  {
    name: 'Gói Cơ Bản',
    price: 29000,
    duration: 'tháng',
    features: [
      'Xem lịch sử không giới hạn',
      'Nhập chỉ số thủ công',
      'Chụp ảnh đồng hồ (OCR tự động)',
      'Biểu đồ phân tích tiêu thụ',
      'Xem hóa đơn chi tiết',
      '📄 Xuất PDF hóa đơn',
      '🤖 AI Chatbot tư vấn',
      '🤖 AI phân tích tiêu thụ',
      '🤖 Phát hiện bất thường',
      '🤖 Gợi ý tiết kiệm thông minh'
    ],
    limitations: [],
    highlighted: true,
    type: 'tenant'
  }
]

// Landlord plans
const landlordPlans = [
  {
    name: 'Gói Miễn Phí (Chủ Trọ)',
    price: 0,
    duration: 'tháng',
    features: [
      'Quản lý tối đa 2 phòng',
      'Theo dõi tiêu thụ điện cơ bản',
      'Nhập chỉ số thủ công',
      'Quản lý người thuê',
      'Xem lịch sử 3 tháng'
    ],
    limitations: [
      'Không có OCR tự động',
      'Không có biểu đồ phân tích',
      'Không có AI trợ lý'
    ],
    highlighted: false,
    type: 'landlord'
  },
  {
    name: 'Gói Starter',
    price: 99000,
    duration: 'tháng',
    features: [
      'Quản lý tối đa 5 phòng',
      'Theo dõi tiêu thụ điện từng phòng',
      'Quản lý người thuê',
      'Lịch sử chỉ số không giới hạn',
      'Chụp ảnh đồng hồ (OCR)',
      '🤖 AI Chatbot tư vấn'
    ],
    limitations: [
      'Không có biểu đồ phân tích chi tiết',
      'Không có AI phân tích tiêu thụ',
      'Không có phát hiện bất thường'
    ],
    highlighted: false,
    type: 'landlord'
  },
  {
    name: 'Gói Professional',
    price: 199000,
    duration: 'tháng',
    features: [
      'Quản lý tối đa 20 phòng',
      'Tất cả tính năng Starter',
      '📊 Biểu đồ phân tích chi tiết',
      '📊 Phân tích theo ngày/tháng',
      '📊 Xem xu hướng tiêu thụ',
      '🤖 AI phân tích tiêu thụ',
      '🤖 Phát hiện bất thường tự động',
      '🤖 Tư vấn tối ưu chi phí'
    ],
    limitations: [],
    highlighted: true,
    type: 'landlord'
  },
  {
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
    limitations: [],
    highlighted: false,
    type: 'landlord'
  }
]

export default function Pricing() {
  const { user, refreshUser } = useAuthStore()
  const [showModal, setShowModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [currentPlan, setCurrentPlan] = useState<any>(null)
  const [hasRoom, setHasRoom] = useState(false)
  const [voucherCode, setVoucherCode] = useState('')
  const [voucherDiscount, setVoucherDiscount] = useState(0)
  const [voucherError, setVoucherError] = useState('')

  // Debug: Log user role
  useEffect(() => {
    console.log('Pricing page - User role:', user?.role)
    console.log('Pricing page - Full user:', user)
  }, [user])

  // Get plans based on user role
  const plans = user?.role === 'landlord' ? landlordPlans : tenantPlans

  useEffect(() => {
    // Refresh user data to ensure we have the latest role
    refreshUser()
    fetchCurrentPlan()
    checkUserRoom()
  }, [])

  const checkUserRoom = async () => {
    try {
      const response = await api.get('/rooms')
      // If tenant has a room, they don't need to see pricing
      if (user?.role === 'tenant' && response.data.rooms?.length > 0) {
        setHasRoom(true)
      }
    } catch (error) {
      console.error('Failed to check user room')
    }
  }

  const fetchCurrentPlan = async () => {
    try {
      const response = await api.get('/subscriptions/current')
      setCurrentPlan(response.data)
    } catch (error) {
      console.error('Failed to fetch current plan')
    }
  }

  // If tenant has a room, show message instead of pricing
  if (user?.role === 'tenant' && hasRoom) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Bạn đã được gán vào phòng
            </h2>
            <p className="text-gray-600 mb-6">
              Chủ trọ của bạn đã quản lý gói dịch vụ. Bạn có thể sử dụng đầy đủ các tính năng mà không cần mua gói riêng.
            </p>
            <div className="flex gap-4 justify-center">
              <a
                href="/"
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Về Trang Chủ
              </a>
              <a
                href="/nhap-chi-so"
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Nhập Chỉ Số
              </a>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const handleSelectPlan = (plan: any) => {
    setSelectedPlan(plan)
    setShowModal(true)
    setVoucherCode('')
    setVoucherDiscount(0)
    setVoucherError('')
  }

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) {
      setVoucherError('Vui lòng nhập mã voucher')
      return
    }

    try {
      const response = await api.post('/payment/validate-voucher', { voucherCode })
      setVoucherDiscount(response.data.discount)
      setVoucherError('')
      toast.success(`Áp dụng voucher ${response.data.discount}% thành công!`)
    } catch (error: any) {
      setVoucherError(error.response?.data?.error || 'Mã voucher không hợp lệ')
      setVoucherDiscount(0)
    }
  }

  const calculateFinalPrice = () => {
    if (!selectedPlan) return 0
    const basePrice = selectedPlan.price
    if (voucherDiscount > 0) {
      return Math.round(basePrice * (1 - voucherDiscount / 100))
    }
    return basePrice
  }

  const handleConfirmPurchase = async () => {
    if (!selectedPlan) return

    // Free plan - no payment needed
    if (selectedPlan.price === 0) {
      setLoading(true)
      try {
        const response = await api.post('/subscriptions', {
          planName: selectedPlan.name,
          planPrice: 0,
          duration: 1,
          paymentMethod: 'Free',
          voucherCode: undefined
        })
        
        toast.success(response.data.message || 'Đăng ký gói miễn phí thành công!')
        setShowModal(false)
        setSelectedPlan(null)
        setVoucherCode('')
        setVoucherDiscount(0)
        fetchCurrentPlan()
        refreshUser()
      } catch (error: any) {
        toast.error(error.response?.data?.error || 'Không thể đăng ký gói')
      } finally {
        setLoading(false)
      }
      return
    }

    // Paid plan - use PayOS
    setLoading(true)
    try {
      const response = await api.post('/payment/create', {
        planName: selectedPlan.name,
        planPrice: selectedPlan.price,
        duration: 1,
        voucherCode: voucherCode || undefined
      })
      
      // Redirect to PayOS payment page
      if (response.data.paymentUrl) {
        window.location.href = response.data.paymentUrl
      } else {
        toast.error('Không thể tạo link thanh toán')
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Không thể tạo thanh toán')
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="text-center px-4">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
          Bảng Giá Dịch Vụ {user?.role === 'landlord' ? '- Chủ Trọ' : '- Người Thuê'}
        </h1>
        <p className="text-xs sm:text-sm lg:text-base text-gray-600">Chọn gói phù hợp với nhu cầu của bạn</p>
        {currentPlan && (
          <div className="mt-3 sm:mt-4 inline-block bg-green-100 text-green-800 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm lg:text-base">
            Gói hiện tại: <strong>{currentPlan.planName}</strong>
          </div>
        )}
      </div>

      <div className={`grid grid-cols-1 ${plans.length === 4 ? 'md:grid-cols-2 lg:grid-cols-4' : 'md:grid-cols-2 lg:grid-cols-3'} gap-4 sm:gap-6`}>
        {plans.map((plan, index) => (
          <div 
            key={index}
            className={`bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 border border-gray-200 shadow-sm flex flex-col ${
              plan.highlighted ? 'ring-2 ring-emerald-500 shadow-xl' : ''
            }`}
          >
            {plan.highlighted && (
              <div className="bg-emerald-500 text-white text-center py-1.5 sm:py-2 -mx-4 sm:-mx-6 -mt-4 sm:-mt-6 mb-4 sm:mb-6 rounded-t-lg text-xs sm:text-sm font-medium">
                Phổ biến nhất
              </div>
            )}
            
            <div className="text-center mb-4 sm:mb-6">
              <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
              <div className="flex items-baseline justify-center">
                <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                  {plan.price.toLocaleString('vi-VN')}đ
                </span>
                <span className="text-xs sm:text-sm text-gray-600 ml-1 sm:ml-2">/{plan.duration}</span>
              </div>
            </div>

            <ul className="space-y-2 sm:space-y-3 mb-4 sm:mb-6 flex-grow">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-start">
                  <Check size={16} className="text-emerald-600 mr-2 flex-shrink-0 mt-0.5 sm:w-5 sm:h-5" />
                  <span className="text-xs sm:text-sm text-gray-700">{feature}</span>
                </li>
              ))}
              {plan.limitations.map((limitation, i) => (
                <li key={`limit-${i}`} className="flex items-start">
                  <X size={16} className="text-gray-400 mr-2 flex-shrink-0 mt-0.5 sm:w-5 sm:h-5" />
                  <span className="text-xs sm:text-sm text-gray-500">{limitation}</span>
                </li>
              ))}
            </ul>

            <button 
              onClick={() => handleSelectPlan(plan)}
              disabled={currentPlan?.planName === plan.name}
              className={`w-full px-4 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                plan.highlighted 
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } ${
                currentPlan?.planName === plan.name ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {currentPlan?.planName === plan.name ? 'Gói hiện tại' : plan.price === 0 ? 'Chọn gói này' : 'Đăng ký ngay'}
            </button>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg sm:rounded-xl p-4 sm:p-6">
        <h3 className="font-semibold text-sm sm:text-base lg:text-lg mb-3 sm:mb-4">Câu hỏi thường gặp</h3>
        <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-gray-700">
          <div>
            <p className="font-medium"><strong>Q:</strong> Tôi có thể hủy gói bất cứ lúc nào không?</p>
            <p className="text-gray-600 mt-1"><strong>A:</strong> Có, bạn có thể hủy bất cứ lúc nào mà không mất phí.</p>
          </div>
          
          <div>
            <p className="font-medium"><strong>Q:</strong> Dữ liệu của tôi có được bảo mật không?</p>
            <p className="text-gray-600 mt-1"><strong>A:</strong> Tất cả dữ liệu được mã hóa và bảo mật tuyệt đối.</p>
          </div>

          <div>
            <p className="font-medium"><strong>Q:</strong> Tôi có thể nâng cấp gói sau không?</p>
            <p className="text-gray-600 mt-1"><strong>A:</strong> Có, bạn có thể nâng cấp hoặc hạ cấp gói bất cứ lúc nào.</p>
          </div>

          <div>
            <p className="font-medium"><strong>Q:</strong> Giới hạn phòng có được thực thi không?</p>
            <p className="text-gray-600 mt-1"><strong>A:</strong> Có, hệ thống sẽ tự động kiểm tra và chặn khi bạn vượt quá giới hạn gói.</p>
          </div>
          
          <div>
            <p className="font-medium"><strong>Q:</strong> Tính năng OCR có chính xác không?</p>
            <p className="text-gray-600 mt-1"><strong>A:</strong> OCR có độ chính xác cao nhưng bạn vẫn có thể chỉnh sửa nếu cần.</p>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && selectedPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base sm:text-lg lg:text-xl font-bold">Xác Nhận Đăng Ký</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-3 sm:space-y-4">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Gói dịch vụ</p>
                <p className="text-sm sm:text-base lg:text-lg font-semibold">{selectedPlan.name}</p>
              </div>
              
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Giá</p>
                <div className="space-y-1">
                  {voucherDiscount > 0 && (
                    <p className="text-xs sm:text-sm text-gray-500 line-through">
                      {selectedPlan.price.toLocaleString('vi-VN')} đ
                    </p>
                  )}
                  <p className="text-base sm:text-lg font-semibold text-emerald-600">
                    {calculateFinalPrice().toLocaleString('vi-VN')} đ/{selectedPlan.duration}
                  </p>
                  {voucherDiscount > 0 && (
                    <p className="text-xs sm:text-sm text-green-600 font-medium">
                      Tiết kiệm {(selectedPlan.price - calculateFinalPrice()).toLocaleString('vi-VN')} đ ({voucherDiscount}%)
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Mã voucher (tùy chọn)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={voucherCode}
                    onChange={(e) => {
                      setVoucherCode(e.target.value.toUpperCase())
                      setVoucherError('')
                    }}
                    placeholder="Nhập mã voucher"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-xs sm:text-sm"
                  />
                  <button
                    onClick={handleApplyVoucher}
                    className="px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-xs sm:text-sm font-medium whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!voucherCode.trim()}
                  >
                    Áp dụng
                  </button>
                </div>
                {voucherError && (
                  <p className="text-xs sm:text-sm text-red-600 mt-1">{voucherError}</p>
                )}
                {voucherDiscount > 0 && (
                  <p className="text-xs sm:text-sm text-green-600 mt-1">✓ Voucher giảm {voucherDiscount}% đã được áp dụng</p>
                )}
              </div>

              <div>
                <p className="text-xs sm:text-sm text-gray-600">Người đăng ký</p>
                <p className="text-sm sm:text-base lg:text-lg font-semibold">{user?.name}</p>
              </div>

              {selectedPlan.price > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs sm:text-sm text-blue-800">
                    💳 Thanh toán qua PayOS - Hỗ trợ Momo, VNPay, Chuyển khoản ngân hàng
                  </p>
                </div>
              )}

              {selectedPlan.price === 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-xs sm:text-sm text-green-800">
                    ✓ Gói miễn phí - Không cần thanh toán
                  </p>
                </div>
              )}

              <div className="flex gap-2 sm:gap-3 mt-4 sm:mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-xs sm:text-sm font-medium transition-colors disabled:opacity-50"
                  disabled={loading}
                >
                  Hủy
                </button>
                <button
                  onClick={handleConfirmPurchase}
                  className="flex-1 px-4 py-2 sm:py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-xs sm:text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? 'Đang xử lý...' : 'Xác Nhận'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
