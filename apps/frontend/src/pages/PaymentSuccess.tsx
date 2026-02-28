import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle, Loader2 } from 'lucide-react'
import api from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'

export default function PaymentSuccess() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { refreshUser, user } = useAuthStore()
  const [verifying, setVerifying] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const orderCode = searchParams.get('orderCode')
    
    if (!orderCode) {
      setError('Không tìm thấy mã đơn hàng')
      setVerifying(false)
      return
    }

    // Verify payment status
    const verifyPayment = async () => {
      try {
        await api.get(`/payment/status/${orderCode}`)
        // Refresh user data to get updated subscription
        await refreshUser()
        setVerifying(false)
      } catch (err: any) {
        console.error('Payment verification error:', err)
        setError('Không thể xác minh thanh toán')
        setVerifying(false)
      }
    }

    // Wait a bit for webhook to process
    setTimeout(verifyPayment, 2000)
  }, [searchParams, refreshUser])

  const handleGoToDashboard = () => {
    if (user?.role === 'landlord') {
      navigate('/quan-ly-phong')
    } else if (user?.role === 'admin') {
      navigate('/admin')
    } else {
      navigate('/trang-chu')
    }
  }

  if (verifying) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <Loader2 className="w-16 h-16 text-emerald-600 mx-auto mb-4 animate-spin" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Đang xác minh thanh toán...
          </h2>
          <p className="text-gray-600">
            Vui lòng đợi trong giây lát
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">❌</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Có lỗi xảy ra
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/bang-gia')}
            className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium"
          >
            Quay lại bảng giá
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
        <CheckCircle className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Thanh toán thành công!
        </h2>
        <p className="text-gray-600 mb-6">
          Gói dịch vụ của bạn đã được kích hoạt. Bạn có thể bắt đầu sử dụng ngay bây giờ.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={handleGoToDashboard}
            className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium"
          >
            Về Dashboard
          </button>
          <button
            onClick={() => navigate('/cai-dat')}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
          >
            Xem gói đã mua
          </button>
        </div>
      </div>
    </div>
  )
}
