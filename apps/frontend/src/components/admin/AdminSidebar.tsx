import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { LayoutDashboard, Users, Home, LogOut, CreditCard, DollarSign, MessageCircle, Gift, X } from 'lucide-react'

interface AdminSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const menuItems = [
    { title: 'Tổng Quan', url: '/admin', icon: LayoutDashboard },
    { title: 'Người Dùng', url: '/admin/users', icon: Users },
    { title: 'Phòng Trọ', url: '/admin/rooms', icon: Home },
    { title: 'Cá Nhân', url: '/admin/tenants', icon: Users },
    { title: 'Gói Dịch Vụ', url: '/admin/subscriptions', icon: CreditCard },
    { title: 'Doanh Thu', url: '/admin/revenue', icon: DollarSign },
    { title: 'Voucher', url: '/admin/vouchers', icon: Gift },
    { title: 'Hỗ Trợ', url: '/admin/support', icon: MessageCircle },
  ]

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin'
    }
    return location.pathname.startsWith(path)
  }

  return (
    <aside className={`fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200 transition-transform duration-300 ${
      isOpen ? 'translate-x-0' : '-translate-x-full'
    } lg:translate-x-0`}>
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
              <CreditCard className="text-white" size={18} />
            </div>
            <span className="text-base sm:text-lg font-semibold">GreenEnergy Admin</span>
          </div>
          
          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 p-3 sm:p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.url)
            return (
              <Link
                key={item.title}
                to={item.url}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active 
                    ? 'bg-green-50 text-green-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon size={18} />
                <span>{item.title}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-3 sm:p-4 border-t">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">Admin</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}
