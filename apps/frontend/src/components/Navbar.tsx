import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { Bell, User, LogOut, Menu, X } from 'lucide-react'
import RoomSelector from './RoomSelector'
import { useState } from 'react'

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuthStore()
  const navigate = useNavigate()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
    setIsMobileMenuOpen(false)
  }

  // Navbar for non-authenticated users
  if (!isAuthenticated) {
    return (
      <nav className="bg-primary-600 text-white shadow-lg">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-2">
              <img src="/logo.png" alt="GreenEnergy AI" className="h-24 sm:h-32 md:h-36 -ml-6 sm:-ml-8 md:-ml-10 mt-2" />
            </Link>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link to="/login" className="hover:bg-primary-700 px-3 sm:px-4 py-2 rounded-md text-sm sm:text-base">
                Đăng Nhập
              </Link>
              <Link to="/register" className="bg-white text-primary-600 px-3 sm:px-4 py-2 rounded-md font-semibold hover:bg-gray-100 text-sm sm:text-base">
                Đăng Ký
              </Link>
            </div>
          </div>
        </div>
      </nav>
    )
  }

  // Navbar for authenticated users
  return (
    <nav className="bg-primary-600 text-white shadow-lg">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2 sm:space-x-4 lg:space-x-6">
            <Link to="/trang-chu" className="flex items-center space-x-2 flex-shrink-0">
              <img src="/logo.png" alt="GreenEnergy AI" className="h-24 sm:h-32 md:h-36 -ml-6 sm:-ml-8 md:-ml-10 mt-2" />
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden lg:flex space-x-1">
              <Link to="/trang-chu" className="hover:bg-primary-700 px-2 py-2 rounded-md text-sm whitespace-nowrap">
                Trang Chủ
              </Link>
              {user?.role === 'admin' && (
                <>
                  <Link to="/admin" className="hover:bg-primary-700 px-2 py-2 rounded-md text-sm whitespace-nowrap">
                    Dashboard
                  </Link>
                  <Link to="/admin/users" className="hover:bg-primary-700 px-2 py-2 rounded-md text-sm whitespace-nowrap">
                    Người Dùng
                  </Link>
                  <Link to="/admin/rooms" className="hover:bg-primary-700 px-2 py-2 rounded-md text-sm whitespace-nowrap">
                    Phòng
                  </Link>
                  <Link to="/admin/tenants" className="hover:bg-primary-700 px-2 py-2 rounded-md text-sm whitespace-nowrap">
                    Cá Nhân
                  </Link>
                  <Link to="/admin/subscriptions" className="hover:bg-primary-700 px-2 py-2 rounded-md text-sm whitespace-nowrap">
                    Gói Dịch Vụ
                  </Link>
                  <Link to="/admin/revenue" className="hover:bg-primary-700 px-2 py-2 rounded-md text-sm whitespace-nowrap">
                    Doanh Thu
                  </Link>
                </>
              )}
              {user?.role === 'landlord' && (
                <Link to="/quan-ly-phong" className="hover:bg-primary-700 px-2 py-2 rounded-md text-sm whitespace-nowrap">
                  Quản Lý Phòng
                </Link>
              )}
              {user?.role !== 'admin' && (
                <>
                  <Link to="/bieu-do-tieu-thu" className="hover:bg-primary-700 px-2 py-2 rounded-md text-sm whitespace-nowrap">
                    Biểu Đồ
                  </Link>
                  <Link to="/nhap-chi-so" className="hover:bg-primary-700 px-2 py-2 rounded-md text-sm whitespace-nowrap">
                    Nhập Chỉ Số
                  </Link>
                  <Link to="/hoa-don" className="hover:bg-primary-700 px-2 py-2 rounded-md text-sm whitespace-nowrap">
                    Hóa Đơn
                  </Link>
                  {user?.role !== 'landlord' && (
                    <Link to="/meo-tiet-kiem" className="hover:bg-primary-700 px-2 py-2 rounded-md text-sm whitespace-nowrap">
                      Mẹo Tiết Kiệm
                    </Link>
                  )}
                  <Link to="/bang-gia" className="hover:bg-primary-700 px-2 py-2 rounded-md text-sm whitespace-nowrap">
                    Bảng Giá
                  </Link>
                  <Link to="/cai-dat" className="hover:bg-primary-700 px-2 py-2 rounded-md text-sm whitespace-nowrap">
                    Cài Đặt
                  </Link>
                  {user?.role === 'landlord' && (
                    <Link to="/ho-tro" className="hover:bg-primary-700 px-2 py-2 rounded-md text-sm whitespace-nowrap">
                      Hỗ Trợ
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {user?.role !== 'admin' && <div className="hidden sm:block"><RoomSelector /></div>}
            
            <button className="hover:bg-primary-700 p-2 rounded-full hidden sm:block">
              <Bell size={18} />
            </button>
            
            <div className="hidden md:flex items-center space-x-2 px-3 py-1 bg-primary-700 rounded-lg">
              <User size={18} />
              <span className="text-sm font-medium">{user?.name}</span>
            </div>
            
            <button 
              onClick={handleLogout}
              className="hover:bg-primary-700 p-2 rounded-full hidden lg:block"
              title="Đăng xuất"
            >
              <LogOut size={18} />
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden hover:bg-primary-700 p-2 rounded-lg transition-colors"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-primary-500 py-4 space-y-2">
            {user?.role !== 'admin' && (
              <div className="sm:hidden pb-2 border-b border-primary-500">
                <RoomSelector />
              </div>
            )}
            
            <Link 
              to="/trang-chu" 
              className="block hover:bg-primary-700 px-4 py-2 rounded-md text-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Trang Chủ
            </Link>
            
            {user?.role === 'admin' && (
              <>
                <Link to="/admin" className="block hover:bg-primary-700 px-4 py-2 rounded-md text-sm" onClick={() => setIsMobileMenuOpen(false)}>
                  Dashboard
                </Link>
                <Link to="/admin/users" className="block hover:bg-primary-700 px-4 py-2 rounded-md text-sm" onClick={() => setIsMobileMenuOpen(false)}>
                  Người Dùng
                </Link>
                <Link to="/admin/rooms" className="block hover:bg-primary-700 px-4 py-2 rounded-md text-sm" onClick={() => setIsMobileMenuOpen(false)}>
                  Phòng
                </Link>
                <Link to="/admin/tenants" className="block hover:bg-primary-700 px-4 py-2 rounded-md text-sm" onClick={() => setIsMobileMenuOpen(false)}>
                  Cá Nhân
                </Link>
                <Link to="/admin/subscriptions" className="block hover:bg-primary-700 px-4 py-2 rounded-md text-sm" onClick={() => setIsMobileMenuOpen(false)}>
                  Gói Dịch Vụ
                </Link>
                <Link to="/admin/revenue" className="block hover:bg-primary-700 px-4 py-2 rounded-md text-sm" onClick={() => setIsMobileMenuOpen(false)}>
                  Doanh Thu
                </Link>
              </>
            )}
            
            {user?.role === 'landlord' && (
              <Link to="/quan-ly-phong" className="block hover:bg-primary-700 px-4 py-2 rounded-md text-sm" onClick={() => setIsMobileMenuOpen(false)}>
                Quản Lý Phòng
              </Link>
            )}
            
            {user?.role !== 'admin' && (
              <>
                <Link to="/bieu-do-tieu-thu" className="block hover:bg-primary-700 px-4 py-2 rounded-md text-sm" onClick={() => setIsMobileMenuOpen(false)}>
                  Biểu Đồ
                </Link>
                <Link to="/nhap-chi-so" className="block hover:bg-primary-700 px-4 py-2 rounded-md text-sm" onClick={() => setIsMobileMenuOpen(false)}>
                  Nhập Chỉ Số
                </Link>
                <Link to="/hoa-don" className="block hover:bg-primary-700 px-4 py-2 rounded-md text-sm" onClick={() => setIsMobileMenuOpen(false)}>
                  Hóa Đơn
                </Link>
                {user?.role !== 'landlord' && (
                  <Link to="/meo-tiet-kiem" className="block hover:bg-primary-700 px-4 py-2 rounded-md text-sm" onClick={() => setIsMobileMenuOpen(false)}>
                    Mẹo Tiết Kiệm
                  </Link>
                )}
                <Link to="/bang-gia" className="block hover:bg-primary-700 px-4 py-2 rounded-md text-sm" onClick={() => setIsMobileMenuOpen(false)}>
                  Bảng Giá
                </Link>
                <Link to="/cai-dat" className="block hover:bg-primary-700 px-4 py-2 rounded-md text-sm" onClick={() => setIsMobileMenuOpen(false)}>
                  Cài Đặt
                </Link>
                {user?.role === 'landlord' && (
                  <Link to="/ho-tro" className="block hover:bg-primary-700 px-4 py-2 rounded-md text-sm" onClick={() => setIsMobileMenuOpen(false)}>
                    Hỗ Trợ
                  </Link>
                )}
              </>
            )}

            <div className="pt-2 border-t border-primary-500 space-y-2">
              <div className="md:hidden flex items-center space-x-2 px-4 py-2 bg-primary-700 rounded-lg">
                <User size={18} />
                <span className="text-sm font-medium">{user?.name}</span>
              </div>
              
              <button 
                onClick={handleLogout}
                className="lg:hidden w-full text-left hover:bg-primary-700 px-4 py-2 rounded-md text-sm flex items-center space-x-2"
              >
                <LogOut size={18} />
                <span>Đăng xuất</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
