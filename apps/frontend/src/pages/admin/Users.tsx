import { useEffect, useState } from 'react'
import { Search, Trash2, Eye, CreditCard, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import api from '@/lib/api'
import toast from 'react-hot-toast'

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false)
  const [newPlan, setNewPlan] = useState('')
  const [newExpiry, setNewExpiry] = useState('')
  const itemsPerPage = 10
  const navigate = useNavigate()

  useEffect(() => {
    fetchUsers()
  }, [search, roleFilter])

  const fetchUsers = async () => {
    try {
      const params: any = {}
      if (search) params.search = search
      if (roleFilter) params.role = roleFilter

      const response = await api.get('/admin/users', { params })
      setUsers(response.data.users)
    } catch (error: any) {
      toast.error('Không thể tải danh sách người dùng')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (userId: string, userName: string) => {
    if (!confirm(`Xóa người dùng "${userName}"?`)) return

    try {
      await api.delete(`/admin/users/${userId}`)
      toast.success('Đã xóa người dùng')
      fetchUsers()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Không thể xóa')
    }
  }

  const handleViewLandlordRooms = (landlordId: string, landlordName: string) => {
    navigate(`/admin/rooms?landlordId=${landlordId}&landlordName=${encodeURIComponent(landlordName)}`)
  }

  const handleViewTenant = async (tenantId: string) => {
    try {
      // Check if tenant is assigned to a room
      const roomsResponse = await api.get('/admin/rooms')
      const tenantRoom = roomsResponse.data.rooms.find((room: any) => room.tenantId?._id === tenantId)
      
      if (tenantRoom) {
        // Tenant is assigned to a room, navigate to Rooms page with roomId
        navigate(`/admin/rooms?roomId=${tenantRoom._id}`)
      } else {
        // Tenant is not assigned, navigate to Tenants page
        navigate(`/admin/tenants?tenantId=${tenantId}`)
      }
    } catch (error: any) {
      toast.error('Không thể tải thông tin người thuê')
    }
  }

  const handleManageSubscription = (user: any) => {
    setSelectedUser(user)
    setNewPlan(user.subscriptionPlan || '')
    setNewExpiry(user.subscriptionExpiry ? new Date(user.subscriptionExpiry).toISOString().split('T')[0] : '')
    setShowSubscriptionModal(true)
  }

  const handleUpdateSubscription = async () => {
    if (!selectedUser) return

    try {
      await api.put(`/admin/users/${selectedUser._id}/subscription`, {
        subscriptionPlan: newPlan || null,
        subscriptionExpiry: newExpiry || null
      })
      
      toast.success('Đã cập nhật subscription thành công')
      setShowSubscriptionModal(false)
      fetchUsers()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Không thể cập nhật subscription')
    }
  }

  const handleCancelSubscription = async () => {
    if (!selectedUser) return
    
    if (!confirm(`Hủy gói của "${selectedUser.name}"?`)) return

    try {
      const freePlan = selectedUser.role === 'landlord' ? 'Gói Miễn Phí (Chủ Trọ)' : 'Gói Miễn Phí'
      
      await api.put(`/admin/users/${selectedUser._id}/subscription`, {
        subscriptionPlan: freePlan,
        subscriptionExpiry: null
      })
      
      toast.success('Đã hủy gói thành công')
      setShowSubscriptionModal(false)
      fetchUsers()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Không thể hủy gói')
    }
  }

  const getRoleBadge = (role: string) => {
    const styles = {
      admin: 'bg-red-100 text-red-700',
      landlord: 'bg-purple-100 text-purple-700',
      tenant: 'bg-green-100 text-green-700'
    }
    const names = { admin: 'Admin', landlord: 'Chủ trọ', tenant: 'Người thuê' }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[role as keyof typeof styles]}`}>
        {names[role as keyof typeof names]}
      </span>
    )
  }

  const getSubscriptionBadge = (user: any) => {
    if (!user.subscriptionPlan || user.subscriptionPlan.includes('Miễn Phí')) {
      return <span className="text-xs text-gray-500">Miễn phí</span>
    }
    
    const now = new Date()
    const expiry = user.subscriptionExpiry ? new Date(user.subscriptionExpiry) : null
    const isExpired = expiry && expiry < now
    
    return (
      <div className="text-xs">
        <div className={isExpired ? 'text-red-600' : 'text-green-600'}>
          {user.subscriptionPlan}
        </div>
        {expiry && (
          <div className="text-gray-500">
            {isExpired ? 'Hết hạn: ' : 'Đến: '}
            {expiry.toLocaleDateString('vi-VN')}
          </div>
        )}
      </div>
    )
  }

  if (loading) return <div className="flex items-center justify-center h-64">Đang tải...</div>

  // Pagination
  const totalPages = Math.ceil(users.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentUsers = users.slice(startIndex, endIndex)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold">Quản Lý Người Dùng</h2>

      <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">Tất cả vai trò</option>
            <option value="tenant">Người thuê</option>
            <option value="landlord">Chủ trọ</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <div className="inline-block min-w-full align-middle px-4 sm:px-0">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 sm:px-6 py-2.5 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 whitespace-nowrap">Người dùng</th>
                  <th className="px-3 sm:px-6 py-2.5 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 whitespace-nowrap">Email</th>
                  <th className="px-3 sm:px-6 py-2.5 sm:py-3 text-center text-xs sm:text-sm font-semibold text-gray-700 whitespace-nowrap">Vai trò</th>
                  <th className="px-3 sm:px-6 py-2.5 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 whitespace-nowrap">Gói</th>
                  <th className="px-3 sm:px-6 py-2.5 sm:py-3 text-center text-xs sm:text-sm font-semibold text-gray-700 whitespace-nowrap">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {currentUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium whitespace-nowrap">{user.name}</td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600 whitespace-nowrap">{user.email}</td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-center whitespace-nowrap">{getRoleBadge(user.role)}</td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">{getSubscriptionBadge(user)}</td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1 sm:gap-2">
                        <button
                          onClick={() => handleManageSubscription(user)}
                          className="p-1.5 sm:p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title="Quản lý gói"
                        >
                          <CreditCard size={16} className="sm:w-[18px] sm:h-[18px]" />
                        </button>
                        {user.role === 'landlord' ? (
                          <button
                            onClick={() => handleViewLandlordRooms(user._id, user.name)}
                            className="p-1.5 sm:p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Xem phòng quản lý"
                          >
                            <Eye size={16} className="sm:w-[18px] sm:h-[18px]" />
                          </button>
                        ) : user.role === 'tenant' ? (
                          <button
                            onClick={() => handleViewTenant(user._id)}
                            className="p-1.5 sm:p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Xem chi tiết"
                          >
                            <Eye size={16} className="sm:w-[18px] sm:h-[18px]" />
                          </button>
                        ) : null}
                        {user.role !== 'admin' && (
                          <button
                            onClick={() => handleDelete(user._id, user.name)}
                            className="p-1.5 sm:p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Xóa người dùng"
                          >
                            <Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Pagination */}
      {users.length > itemsPerPage && (
        <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
            <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
              Hiển thị {startIndex + 1}-{Math.min(endIndex, users.length)} trong tổng số {users.length} người dùng
            </div>
            <div className="flex gap-1 sm:gap-2 flex-wrap justify-center">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Trước
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm border rounded-lg transition-colors ${
                    currentPage === page
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Sau
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Subscription Management Modal */}
      {showSubscriptionModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg sm:rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between sticky top-0 bg-white">
              <div className="min-w-0 flex-1 mr-2">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate">Quản Lý Gói</h2>
                <p className="text-xs sm:text-sm text-gray-600 truncate">{selectedUser.name} - {selectedUser.email}</p>
              </div>
              <button
                onClick={() => setShowSubscriptionModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg flex-shrink-0 transition-colors"
              >
                <X size={20} className="sm:w-6 sm:h-6" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-4">
              {/* Current Subscription Info */}
              <div className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200">
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-2">Gói hiện tại</h3>
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm">
                    <span className="text-gray-600">Gói: </span>
                    <span className="font-medium">{selectedUser.subscriptionPlan || 'Chưa có'}</span>
                  </p>
                  {selectedUser.subscriptionExpiry && (
                    <p className="text-xs sm:text-sm">
                      <span className="text-gray-600">Hết hạn: </span>
                      <span className="font-medium">
                        {new Date(selectedUser.subscriptionExpiry).toLocaleDateString('vi-VN')}
                      </span>
                    </p>
                  )}
                </div>
              </div>

              {/* Update Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                    Gói mới
                  </label>
                  <select
                    value={newPlan}
                    onChange={(e) => setNewPlan(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">-- Chọn gói --</option>
                    {selectedUser.role === 'tenant' ? (
                      <>
                        <option value="Gói Miễn Phí">Gói Miễn Phí</option>
                        <option value="Gói Cơ Bản">Gói Cơ Bản (29k)</option>
                      </>
                    ) : (
                      <>
                        <option value="Gói Miễn Phí (Chủ Trọ)">Gói Miễn Phí (Chủ Trọ)</option>
                        <option value="Gói Starter">Gói Starter (99k)</option>
                        <option value="Gói Professional">Gói Professional (199k)</option>
                        <option value="Gói Business">Gói Business (299k)</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                    Ngày hết hạn
                  </label>
                  <input
                    type="date"
                    value={newExpiry}
                    onChange={(e) => setNewExpiry(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                  <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                    Để trống nếu muốn gói không có thời hạn (miễn phí vĩnh viễn)
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4">
                <button
                  onClick={handleUpdateSubscription}
                  className="flex-1 px-4 sm:px-6 py-2 text-sm sm:text-base bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                >
                  Cập nhật
                </button>
                <button
                  onClick={handleCancelSubscription}
                  className="px-4 sm:px-6 py-2 text-sm sm:text-base bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Hủy gói
                </button>
                <button
                  onClick={() => setShowSubscriptionModal(false)}
                  className="px-4 sm:px-6 py-2 text-sm sm:text-base border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
