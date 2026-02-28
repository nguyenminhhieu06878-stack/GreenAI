import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Zap, BarChart3, Sparkles, Leaf, Eye, EyeOff } from 'lucide-react'
import api from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'
import toast from 'react-hot-toast'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuthStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await api.post('/auth/login', { email, password })
      login(response.data.user, response.data.token)
      toast.success('Đăng nhập thành công!')
      
      if (response.data.user.role === 'admin') {
        navigate('/admin')
      } else if (response.data.user.role === 'landlord') {
        navigate('/quan-ly-phong')
      } else {
        navigate('/')
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Đăng nhập thất bại'
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Panel - Info */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-700 via-teal-700 to-cyan-800 p-8 lg:p-12 flex-col justify-between text-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-10 left-10 w-96 h-96 bg-teal-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-cyan-400 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-sm">
              <Zap size={28} className="text-white" />
            </div>
            <span className="text-2xl font-bold">GreenEnergyAI</span>
          </div>
          
          <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
            Quản lý điện năng thông minh
          </h1>
          
          <p className="text-emerald-50 text-lg mb-16 leading-relaxed">
            Chụp ảnh hóa đơn bằng OCR, theo dõi tiêu thụ, phân tích xu hướng và nhận AI tư vấn để tiết kiệm hiệu quả.
          </p>

          <div className="grid grid-cols-2 gap-5">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 hover:bg-white/15 transition">
              <div className="bg-white/20 w-12 h-12 rounded-xl flex items-center justify-center mb-3">
                <BarChart3 size={22} className="text-white" />
              </div>
              <h3 className="font-semibold mb-1 text-white">OCR đồng hồ</h3>
              <p className="text-emerald-100 text-sm">Nhanh & chính xác</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 hover:bg-white/15 transition">
              <div className="bg-white/20 w-12 h-12 rounded-xl flex items-center justify-center mb-3">
                <Sparkles size={22} className="text-white" />
              </div>
              <h3 className="font-semibold mb-1 text-white">Cảnh báo</h3>
              <p className="text-emerald-100 text-sm">Bất thường</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 hover:bg-white/15 transition">
              <div className="bg-white/20 w-12 h-12 rounded-xl flex items-center justify-center mb-3">
                <Leaf size={22} className="text-white" />
              </div>
              <h3 className="font-semibold mb-1 text-white">Bảo mật</h3>
              <p className="text-emerald-100 text-sm">Riêng tư</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 hover:bg-white/15 transition">
              <div className="bg-white/20 w-12 h-12 rounded-xl flex items-center justify-center mb-3">
                <Zap size={22} className="text-white" />
              </div>
              <h3 className="font-semibold mb-1 text-white">AI Chatbot</h3>
              <p className="text-emerald-100 text-sm">Tư vấn 24/7</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between text-emerald-100 text-sm">
          <span>Secure • Fast • Energy-first</span>
          <Link to="/" className="hover:text-white transition underline">Về trang chủ</Link>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-slate-800 via-slate-850 to-slate-900 relative">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="bg-emerald-500 p-2 rounded-lg">
              <Zap size={24} className="text-white" />
            </div>
            <span className="text-xl font-bold text-white">GreenEnergyAI</span>
          </div>

          <div className="mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Đăng nhập</h2>
            <p className="text-sm sm:text-base text-slate-400">Tiếp tục sử dụng hệ thống GreenEnergyAI.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm backdrop-blur-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white placeholder-slate-400 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:bg-slate-700 transition backdrop-blur-sm"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white placeholder-slate-400 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:bg-slate-700 transition pr-12 backdrop-blur-sm"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 bg-slate-700 border-slate-600 rounded focus:ring-emerald-500 focus:ring-offset-slate-800"
                />
                <span className="text-sm text-slate-300">Ghi nhớ</span>
              </label>
              <Link to="/forgot-password" className="text-sm text-emerald-400 hover:text-emerald-300 transition">
                Quên mật khẩu?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold py-3.5 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/30"
            >
              {loading ? 'Đang xử lý...' : 'Đăng nhập →'}
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-slate-800 text-slate-400">HOẶC</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                // Check if Google OAuth is configured
                window.location.href = 'http://localhost:3000/api/auth/google';
              }}
              className="w-full bg-white hover:bg-gray-50 text-gray-700 font-medium py-3.5 rounded-lg transition flex items-center justify-center gap-3 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              title="Đăng nhập bằng Google (Cần cấu hình Google OAuth - xem GOOGLE_OAUTH_SETUP.md)"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Đăng nhập bằng Google
            </button>

            <div className="text-center text-sm text-slate-400 mt-6">
              Chưa có tài khoản? <Link to="/register" className="text-emerald-400 hover:text-emerald-300 font-medium transition">Đăng ký ngay</Link>
            </div>

            <div className="text-center text-xs text-slate-500 mt-4">
              Bằng cách đăng nhập, bạn đồng ý với <Link to="/terms" className="text-emerald-400 hover:text-emerald-300 transition">điều khoản sử dụng</Link> của chúng tôi.
            </div>
          </form>
        </div>

        {/* Mobile Home Link - Bottom Left */}
        <Link 
          to="/" 
          className="lg:hidden fixed bottom-4 left-4 text-sm text-emerald-400 hover:text-emerald-300 transition underline flex items-center gap-1"
        >
          ← Về trang chủ
        </Link>
      </div>
    </div>
  )
}
