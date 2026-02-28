import { useEffect, useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'

export default function SubscriptionWarning() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [warning, setWarning] = useState<{
    show: boolean
    type: 'expired' | 'expiring' | null
    daysLeft?: number
  }>({ show: false, type: null })

  useEffect(() => {
    checkSubscriptionStatus()
  }, [user])

  const checkSubscriptionStatus = () => {
    if (!user?.subscriptionExpiry) {
      setWarning({ show: false, type: null })
      return
    }

    const expiryDate = new Date(user.subscriptionExpiry)
    const today = new Date()
    const daysLeft = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    if (daysLeft < 0) {
      // Expired
      setWarning({ show: true, type: 'expired' })
    } else if (daysLeft <= 7) {
      // Expiring soon
      setWarning({ show: true, type: 'expiring', daysLeft })
    } else {
      setWarning({ show: false, type: null })
    }
  }

  if (!warning.show) return null

  if (warning.type === 'expired') {
    return (
      <div className="bg-red-50 border-2 border-red-500 rounded-xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="text-red-600 flex-shrink-0 mt-0.5" size={24} />
          <div className="flex-1">
            <h3 className="font-bold text-red-900 mb-1">⚠️ Gói dịch vụ của bạn đã hết hạn!</h3>
            <p className="text-sm text-red-800 mb-3">
              Gói <strong>{(user as any)?.subscriptionPlan}</strong> đã hết hạn. Một số tính năng có thể bị giới hạn. 
              Vui lòng gia hạn để tiếp tục sử dụng đầy đủ tính năng.
            </p>
            <button
              onClick={() => navigate('/bang-gia')}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
            >
              Gia hạn ngay →
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (warning.type === 'expiring') {
    return (
      <div className="bg-yellow-50 border-2 border-yellow-500 rounded-xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="text-yellow-600 flex-shrink-0 mt-0.5" size={24} />
          <div className="flex-1">
            <h3 className="font-bold text-yellow-900 mb-1">⏰ Gói dịch vụ sắp hết hạn!</h3>
            <p className="text-sm text-yellow-800 mb-3">
              Gói <strong>{(user as any)?.subscriptionPlan}</strong> của bạn sẽ hết hạn trong <strong>{warning.daysLeft} ngày</strong>. 
              Gia hạn ngay để không bị gián đoạn dịch vụ.
            </p>
            <button
              onClick={() => navigate('/bang-gia')}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm font-medium"
            >
              Gia hạn ngay →
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}
