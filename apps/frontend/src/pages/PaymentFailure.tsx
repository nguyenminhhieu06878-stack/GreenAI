import { useNavigate } from 'react-router-dom'
import { XCircle } from 'lucide-react'

export default function PaymentFailure() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
        <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Thanh toán thất bại
        </h2>
        <p className="text-gray-600 mb-6">
          Giao dịch của bạn đã bị hủy hoặc không thành công. Vui lòng thử lại.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate('/bang-gia')}
            className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium"
          >
            Thử lại
          </button>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    </div>
  )
}
