import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, User, Home, Zap, Calendar, Camera, Edit2, Trash2 } from 'lucide-react'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/stores/authStore'

interface Room {
  _id: string
  name: string
  address?: string
  electricityRate: number
  status: string
  landlordId: {
    _id: string
    name: string
    email: string
  }
  tenantId?: {
    _id: string
    name: string
    email: string
  }
}

interface Reading {
  _id: string
  value: number
  consumption: number
  cost: number
  createdAt: string
  userId: {
    _id: string
    name: string
    email: string
    role: string
  }
  method: string
  imagePath?: string
}

export default function RoomDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [room, setRoom] = useState<Room | null>(null)
  const [readings, setReadings] = useState<Reading[]>([])
  const [isLandlord, setIsLandlord] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRoomDetails()
  }, [id])

  const fetchRoomDetails = async () => {
    try {
      const response = await api.get(`/rooms/${id}`)
      setRoom(response.data.room)
      setReadings(response.data.readings)
      setIsLandlord(response.data.isLandlord)
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Không thể tải thông tin phòng')
      navigate('/quan-ly-phong')
    } finally {
      setLoading(false)
    }
  }

  const handleAddReading = () => {
    navigate(`/nhap-chi-so?roomId=${id}`)
  }

  const handleDeleteReading = async (readingId: string) => {
    if (!confirm('Bạn có chắc muốn xóa chỉ số này?')) return

    try {
      await api.delete(`/meter/readings/${readingId}`)
      toast.success('Đã xóa chỉ số')
      fetchRoomDetails() // Reload data
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Không thể xóa chỉ số')
    }
  }

  const canDelete = (reading: Reading) => {
    // Landlord can delete any reading
    if (user?.role === 'landlord') return true
    
    // Tenant can only delete their own readings
    // Cannot delete landlord's readings
    if (reading.userId.role === 'landlord') return false
    return reading.userId._id === user?.id
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Đang tải...</div>
  }

  if (!room) {
    return <div className="text-center text-gray-600">Không tìm thấy phòng</div>
  }

  const totalConsumption = readings.reduce((sum, r) => sum + r.consumption, 0)
  const totalCost = readings.reduce((sum, r) => sum + r.cost, 0)

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          onClick={() => navigate(isLandlord ? '/quan-ly-phong' : '/trang-chu')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
        >
          <ArrowLeft size={20} className="sm:w-6 sm:h-6" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">{room.name}</h1>
          {room.address && <p className="text-sm sm:text-base text-gray-600 truncate">{room.address}</p>}
        </div>
        {!isLandlord && (
          <button
            onClick={handleAddReading}
            className="btn btn-primary flex items-center gap-2 flex-shrink-0 text-sm sm:text-base px-3 sm:px-4"
          >
            <Camera size={18} className="sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Nhập Chỉ Số</span>
            <span className="sm:hidden">Nhập</span>
          </button>
        )}
      </div>

      {/* Room Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Home className="text-blue-600" size={20} />
            </div>
            <span className="text-sm text-gray-600">Chủ trọ</span>
          </div>
          <p className="font-semibold text-gray-900">{room.landlordId.name}</p>
          <p className="text-sm text-gray-600">{room.landlordId.email}</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <User className="text-green-600" size={20} />
            </div>
            <span className="text-sm text-gray-600">Người thuê</span>
          </div>
          {room.tenantId ? (
            <>
              <p className="font-semibold text-gray-900">{room.tenantId.name}</p>
              <p className="text-sm text-gray-600">{room.tenantId.email}</p>
            </>
          ) : (
            <p className="text-gray-400">Chưa có người thuê</p>
          )}
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Zap className="text-orange-600" size={20} />
            </div>
            <span className="text-sm text-gray-600">Tổng tiêu thụ</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalConsumption.toFixed(1)}</p>
          <p className="text-sm text-gray-600">kWh</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Calendar className="text-purple-600" size={20} />
            </div>
            <span className="text-sm text-gray-600">Tổng chi phí</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalCost.toLocaleString('vi-VN')}</p>
          <p className="text-sm text-gray-600">đồng</p>
        </div>
      </div>

      {/* Readings History */}
      <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Lịch Sử Nhập Chỉ Số</h2>
        
        {readings.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            Chưa có dữ liệu chỉ số điện
          </div>
        ) : (
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="w-full min-w-[768px]">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Ngày</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Người nhập</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Chỉ số</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Tiêu thụ</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Chi phí</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Phương thức</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Hình ảnh</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {readings.map((reading) => (
                  <tr key={reading._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {new Date(reading.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <div>
                        <p className="text-gray-900">{reading.userId.name}</p>
                        <p className="text-xs text-gray-500">
                          {reading.userId.role === 'landlord' ? 'Chủ trọ' : 'Người thuê'}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-right font-semibold text-gray-900">
                      {reading.value}
                    </td>
                    <td className="py-3 px-4 text-sm text-right text-gray-900">
                      {reading.consumption.toFixed(1)} kWh
                    </td>
                    <td className="py-3 px-4 text-sm text-right font-semibold text-green-600">
                      {reading.cost.toLocaleString('vi-VN')} đ
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        reading.method === 'auto'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {reading.method === 'auto' ? 'Tự động' : 'Thủ công'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {reading.imagePath ? (
                        <button
                          onClick={() => window.open(`http://localhost:3000/${reading.imagePath}`, '_blank')}
                          className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                        >
                          Xem ảnh
                        </button>
                      ) : (
                        <span className="text-gray-400 text-sm">Không có</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {canDelete(reading) ? (
                        <button
                          onClick={() => handleDeleteReading(reading._id)}
                          className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors inline-flex items-center justify-center"
                          title="Xóa"
                        >
                          <Trash2 size={16} />
                        </button>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
