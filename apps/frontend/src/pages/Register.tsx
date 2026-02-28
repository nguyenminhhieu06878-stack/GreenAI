import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Zap, CheckCircle, TrendingUp, Shield } from 'lucide-react'
import api from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'
import toast from 'react-hot-toast'

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'tenant' as 'tenant' | 'landlord',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuthStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      const errorMsg = 'Mật khẩu không khớp'
      setError(errorMsg)
      toast.error(errorMsg)
      return
    }

    if (formData.password.length < 6) {
      const errorMsg = 'Mật khẩu phải có ít nhất 6 ký tự'
      setError(errorMsg)
      toast.error(errorMsg)
      return
    }

    setLoading(true)

    try {
      const response = await api.post('/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      })

      const userData = {
        ...response.data.user,
        role: formData.role,
      }

      login(userData, response.data.token)
      
      // Show success message with free trial info for tenants
      if (formData.role === 'tenant') {
        toast.success('🎉 Đăng ký thành công! Bạn được tặng FREE 2 tháng Gói Cơ Bản!', {
          duration: 5000,
        })
      } else {
        toast.success('Đăng ký thành công!')
      }

      if (formData.role === 'landlord') {
        navigate('/quan-ly-phong')
      } else {
        navigate('/')
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Đăng ký thất bại'
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Panel - Info */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-600 to-teal-700 p-8 lg:p-12 flex-col justify-between text-white">
        <div className="flex-1 flex flex-col justify-center max-w-xl mx-auto w-full">
          <div className="flex items-center gap-3 mb-12">
            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
              <Zap size={32} />
            </div>
            <span className="text-2xl font-bold">GreenEnergyAI</span>
          </div>

          <h1 className="text-4xl font-bold mb-6">
            Quản lý tiền
            <br />
            <span className="text-emerald-200">thật phong cách.</span>
          </h1>

          <p className="text-emerald-100 text-lg mb-12">
            Trải nghiệm nền tảng quản lý tài chính hiện đại nhất hiện nay.
          </p>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm flex-shrink-0">
                <CheckCircle size={20} />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Lập ngân sách thông minh</h3>
                <p className="text-emerald-100 text-sm">Theo dõi chi tiêu và tiết kiệm hiệu quả</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm flex-shrink-0">
                <TrendingUp size={20} />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Đầu xuất tiết kiệm tự động</h3>
                <p className="text-emerald-100 text-sm">
                  AI phân tích và đề xuất cách tiết kiệm tối ưu
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm flex-shrink-0">
                <Shield size={20} />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Bảo mật chuẩn Fintech</h3>
                <p className="text-emerald-100 text-sm">Dữ liệu được mã hóa và bảo vệ tuyệt đối</p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-emerald-100 text-sm mt-8">© 2024 GreenEnergyAI • Về trang chủ</div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-gray-50 relative">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="bg-emerald-500 p-2 rounded-lg">
              <Zap size={24} className="text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">GreenEnergyAI</span>
          </div>

          <div className="mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Đăng ký</h2>
            <p className="text-sm sm:text-base text-gray-600">Chào mừng bạn đến với sự thịnh vượng!</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ĐỊA CHỈ EMAIL</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="name@company.com"
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">HỌ VÀ TÊN</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nguyễn Văn A"
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">MẬT KHẨU</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                XÁC NHẬN MẬT KHẨU
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="Nhập lại mật khẩu"
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">NGƯỜI ĐĂNG KÝ</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                disabled={loading}
              >
                <option value="tenant">Người Thuê Trọ</option>
                <option value="landlord">Chủ Trọ</option>
              </select>
            </div>

            <div className="flex items-start gap-2 text-sm text-gray-600">
              <input type="checkbox" required className="mt-1" />
              <span>
                Tôi đồng ý với{' '}
                <Link to="/terms" className="text-emerald-600 hover:underline">
                  Điều khoản
                </Link>{' '}
                &{' '}
                <Link to="/privacy" className="text-emerald-600 hover:underline">
                  Chính sách bảo mật
                </Link>{' '}
                của GreenEnergyAI.
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Đang xử lý...' : 'ĐĂNG KÝ NGAY'}
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 text-gray-500">Hoặc đăng ký với</span>
              </div>
            </div>

            {/* Google Sign In Button */}
            <a
              href="http://localhost:3000/api/auth/google"
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Đăng ký với Google
            </a>

            <div className="text-center text-sm text-gray-600">
              Đã là thành viên?{' '}
              <Link to="/login" className="text-emerald-600 hover:underline font-medium">
                Đăng nhập
              </Link>
            </div>
          </form>
        </div>

        {/* Mobile Home Link - Bottom Left */}
        <Link 
          to="/" 
          className="lg:hidden fixed bottom-4 left-4 text-sm text-emerald-600 hover:text-emerald-700 transition underline flex items-center gap-1"
        >
          ← Về trang chủ
        </Link>
      </div>
    </div>
  )
}
