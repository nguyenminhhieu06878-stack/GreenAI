import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, UserPlus, UserMinus, Home, Users } from 'lucide-react'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

interface Room {
  _id: string
  name: string
  address?: string
  electricityRate: number
  status: 'active' | 'inactive'
  tenantId?: {
    _id: string
    name: string
    email: string
  }
  createdAt: string
}

export default function RoomManagement() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    electricityRate: 2500
  })
  const [editFormData, setEditFormData] = useState({
    name: '',
    address: '',
    electricityRate: 2500
  })
  const [tenantEmail, setTenantEmail] = useState('')
  const [roomLimit, setRoomLimit] = useState(2) // Default to free plan limit
  const navigate = useNavigate()

  useEffect(() => {
    fetchRooms()
    fetchRoomLimit()
  }, [])

  const fetchRoomLimit = async () => {
    try {
      const response = await api.get('/subscriptions/room-limit')
      setRoomLimit(response.data.limit)
    } catch (error) {
      console.error('Failed to fetch room limit:', error)
      // Default to 2 for free plan
      setRoomLimit(2)
    }
  }

  const fetchRooms = async () => {
    try {
      const response = await api.get('/rooms')
      setRooms(response.data.rooms)
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Không thể tải danh sách phòng')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.post('/rooms', formData)
      toast.success('Tạo phòng thành công!')
      setShowCreateModal(false)
      setFormData({ name: '', address: '', electricityRate: 2500 })
      fetchRooms()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Không thể tạo phòng')
    }
  }

  const handleEditRoom = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRoom) return

    try {
      await api.put(`/rooms/${selectedRoom._id}`, editFormData)
      toast.success('Cập nhật phòng thành công!')
      setShowEditModal(false)
      setSelectedRoom(null)
      fetchRooms()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Không thể cập nhật phòng')
    }
  }

  const openEditModal = (room: Room) => {
    setSelectedRoom(room)
    setEditFormData({
      name: room.name,
      address: room.address || '',
      electricityRate: room.electricityRate
    })
    setShowEditModal(true)
  }

  const handleAssignTenant = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRoom) return

    try {
      await api.post(`/rooms/${selectedRoom._id}/assign-tenant`, { tenantEmail })
      toast.success('Gán người thuê thành công!')
      setShowAssignModal(false)
      setTenantEmail('')
      setSelectedRoom(null)
      fetchRooms()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Không thể gán người thuê')
    }
  }

  const handleRemoveTenant = async (roomId: string) => {
    if (!confirm('Bạn có chắc muốn xóa người thuê khỏi phòng này?')) return

    try {
      await api.post(`/rooms/${roomId}/remove-tenant`)
      toast.success('Đã xóa người thuê')
      fetchRooms()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Không thể xóa người thuê')
    }
  }

  const handleDeleteRoom = async (roomId: string) => {
    if (!confirm('Bạn có chắc muốn xóa phòng này?')) return

    try {
      await api.delete(`/rooms/${roomId}`)
      toast.success('Đã xóa phòng')
      fetchRooms()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Không thể xóa phòng')
    }
  }

  const viewRoomDetails = (roomId: string) => {
    navigate(`/phong/${roomId}`)
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Đang tải...</div>
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Quản Lý Phòng Trọ</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Đang quản lý {rooms.length}/{roomLimit === Infinity ? '∞' : roomLimit} phòng
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          disabled={rooms.length >= roomLimit}
          className="btn btn-primary flex items-center gap-2 justify-center w-full sm:w-auto"
        >
          <Plus size={20} />
          Thêm Phòng
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Home className="text-blue-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Tổng số phòng</p>
              <p className="text-2xl font-bold text-gray-900">{rooms.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <Users className="text-green-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Đã có người thuê</p>
              <p className="text-2xl font-bold text-gray-900">
                {rooms.filter(r => r.tenantId).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Home className="text-orange-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Phòng trống</p>
              <p className="text-2xl font-bold text-gray-900">
                {rooms.filter(r => !r.tenantId).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {rooms.map((room) => (
          <div
            key={room._id}
            className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 min-w-0 pr-2">
                <h3 className="font-bold text-base sm:text-lg text-gray-900 truncate">{room.name}</h3>
                {room.address && (
                  <p className="text-xs sm:text-sm text-gray-600 mt-1 truncate">{room.address}</p>
                )}
              </div>
              <span
                className={`px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap flex-shrink-0 ${
                  room.status === 'active'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {room.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Giá điện:</span>
                <span className="font-semibold">{room.electricityRate.toLocaleString('vi-VN')} đ/kWh</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Người thuê:</span>
                {room.tenantId ? (
                  <span className="font-semibold text-green-600">{room.tenantId.name}</span>
                ) : (
                  <span className="text-gray-400">Chưa có</span>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => viewRoomDetails(room._id)}
                className="flex-1 px-2 sm:px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-xs sm:text-sm"
              >
                Xem Chi Tiết
              </button>
              <button
                onClick={() => openEditModal(room)}
                className="p-2 border border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                title="Chỉnh sửa phòng"
              >
                <Edit2 size={16} className="sm:w-[18px] sm:h-[18px]" />
              </button>
              {room.tenantId ? (
                <button
                  onClick={() => handleRemoveTenant(room._id)}
                  className="p-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  title="Xóa người thuê"
                >
                  <UserMinus size={18} />
                </button>
              ) : (
                <button
                  onClick={() => {
                    setSelectedRoom(room)
                    setShowAssignModal(true)
                  }}
                  className="p-2 border border-green-300 text-green-600 rounded-lg hover:bg-green-50 transition-colors"
                  title="Gán người thuê"
                >
                  <UserPlus size={18} />
                </button>
              )}
              <button
                onClick={() => handleDeleteRoom(room._id)}
                className="p-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                title="Xóa phòng"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Room Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Tạo Phòng Mới</h2>
            <form onSubmit={handleCreateRoom} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên phòng *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Ví dụ: Phòng 101"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Địa chỉ
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Địa chỉ phòng trọ"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Giá điện (đ/kWh)
                </label>
                <input
                  type="number"
                  value={formData.electricityRate}
                  onChange={(e) => setFormData({ ...formData, electricityRate: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button type="submit" className="flex-1 btn btn-primary">
                  Tạo Phòng
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Tenant Modal */}
      {showAssignModal && selectedRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Gán Người Thuê - {selectedRoom.name}
            </h2>
            <form onSubmit={handleAssignTenant} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email người thuê *
                </label>
                <input
                  type="email"
                  required
                  value={tenantEmail}
                  onChange={(e) => setTenantEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="email@example.com"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Người thuê phải đã đăng ký tài khoản với email này
                </p>
              </div>
              <div className="flex gap-3 mt-6">
                <button type="submit" className="flex-1 btn btn-primary">
                  Gán Người Thuê
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAssignModal(false)
                    setSelectedRoom(null)
                    setTenantEmail('')
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Room Modal */}
      {showEditModal && selectedRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Chỉnh Sửa Phòng - {selectedRoom.name}
            </h2>
            <form onSubmit={handleEditRoom} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên phòng *
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Ví dụ: Phòng 101"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Địa chỉ
                </label>
                <input
                  type="text"
                  value={editFormData.address}
                  onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Địa chỉ phòng trọ"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Giá điện (đ/kWh)
                </label>
                <input
                  type="number"
                  value={editFormData.electricityRate}
                  onChange={(e) => setEditFormData({ ...editFormData, electricityRate: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Thay đổi giá điện sẽ áp dụng cho các chỉ số mới
                </p>
              </div>
              <div className="flex gap-3 mt-6">
                <button type="submit" className="flex-1 btn btn-primary">
                  Cập Nhật
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false)
                    setSelectedRoom(null)
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
