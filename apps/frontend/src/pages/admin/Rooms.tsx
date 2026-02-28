import React, { useEffect, useState } from 'react'
import { Search, Eye, ChevronDown, ChevronRight, X, Home, User, Zap, Calendar } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import api from '@/lib/api'
import toast from 'react-hot-toast'

interface RoomDetail {
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

export default function AdminRooms() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [rooms, setRooms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [expandedLandlords, setExpandedLandlords] = useState<Set<string>>(new Set())
  const [selectedRoom, setSelectedRoom] = useState<RoomDetail | null>(null)
  const [roomReadings, setRoomReadings] = useState<Reading[]>([])
  const [loadingDetail, setLoadingDetail] = useState(false)

  useEffect(() => {
    fetchRooms()
  }, [search])

  useEffect(() => {
    // Check if roomId is in URL query
    const roomId = searchParams.get('roomId')
    if (roomId) {
      viewRoomDetail(roomId)
      // Clear the query param after opening modal
      setSearchParams({})
    }
  }, [searchParams])

  const fetchRooms = async () => {
    try {
      const params: any = {}
      if (search) params.search = search

      const response = await api.get('/admin/rooms', { params })
      setRooms(response.data.rooms)
    } catch (error: any) {
      toast.error('Không thể tải danh sách phòng')
    } finally {
      setLoading(false)
    }
  }

  // Group rooms by landlord
  const groupedRooms = rooms.reduce((acc: any, room: any) => {
    const landlordId = room.landlordId._id
    if (!acc[landlordId]) {
      acc[landlordId] = {
        landlord: room.landlordId,
        rooms: []
      }
    }
    acc[landlordId].rooms.push(room)
    return acc
  }, {})

  const toggleLandlord = (landlordId: string) => {
    const newExpanded = new Set(expandedLandlords)
    if (newExpanded.has(landlordId)) {
      newExpanded.delete(landlordId)
    } else {
      newExpanded.add(landlordId)
    }
    setExpandedLandlords(newExpanded)
  }

  const viewRoomDetail = async (roomId: string) => {
    setLoadingDetail(true)
    try {
      const response = await api.get(`/rooms/${roomId}`)
      setSelectedRoom(response.data.room)
      setRoomReadings(response.data.readings || [])
    } catch (error: any) {
      toast.error('Không thể tải chi tiết phòng')
    } finally {
      setLoadingDetail(false)
    }
  }

  const closeModal = () => {
    setSelectedRoom(null)
    setRoomReadings([])
  }

  if (loading) return <div className="flex items-center justify-center h-64">Đang tải...</div>

  const totalConsumption = roomReadings.reduce((sum, r) => sum + r.consumption, 0)
  const totalCost = roomReadings.reduce((sum, r) => sum + r.cost, 0)

  return (
    <div className="space-y-4 sm:space-y-6">
      <h2 className="text-2xl sm:text-3xl font-bold">Quản Lý Phòng</h2>

      <div className="bg-white rounded-xl p-3 sm:p-4 border border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Tìm kiếm phòng..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[768px]">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Chủ trọ</th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Số phòng</th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Đã thuê</th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Trống</th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {Object.entries(groupedRooms).map(([landlordId, data]: [string, any]) => {
              const isExpanded = expandedLandlords.has(landlordId)
              const occupiedCount = data.rooms.filter((r: any) => r.tenantId).length
              const vacantCount = data.rooms.length - occupiedCount

              return (
                <React.Fragment key={landlordId}>
                  {/* Landlord row */}
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleLandlord(landlordId)}
                          className="p-1 hover:bg-gray-200 rounded"
                        >
                          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </button>
                        <div>
                          <div className="text-sm font-medium">{data.landlord.name}</div>
                          <div className="text-xs text-gray-500">{data.landlord.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="font-semibold text-gray-900">{data.rooms.length}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-green-600 font-medium">{occupiedCount}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-gray-600 font-medium">{vacantCount}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => toggleLandlord(landlordId)}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        {isExpanded ? 'Thu gọn' : 'Xem chi tiết'}
                      </button>
                    </td>
                  </tr>

                  {/* Expanded rooms */}
                  {isExpanded && data.rooms.map((room: any) => (
                    <tr key={room._id} className="bg-gray-50">
                      <td className="px-6 py-3 pl-16">
                        <div className="font-medium text-sm">{room.name}</div>
                        {room.address && <div className="text-xs text-gray-500">{room.address}</div>}
                      </td>
                      <td className="px-6 py-3 text-center">
                        {room.tenantId ? (
                          <div>
                            <div className="text-sm font-medium">{room.tenantId.name}</div>
                            <div className="text-xs text-gray-500">{room.tenantId.email}</div>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </td>
                      <td className="px-6 py-3 text-center" colSpan={2}>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          room.tenantId
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {room.tenantId ? 'Đã thuê' : 'Trống'}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-center">
                        <button
                          onClick={() => viewRoomDetail(room._id)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
                          title="Xem chi tiết phòng"
                        >
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              )
            })}
          </tbody>
        </table>
        </div>
      </div>

      {/* Room Detail Modal */}
      {selectedRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            {loadingDetail ? (
              <div className="flex items-center justify-center h-64">Đang tải...</div>
            ) : (
              <>
                {/* Modal Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedRoom.name}</h2>
                    {selectedRoom.address && <p className="text-gray-600">{selectedRoom.address}</p>}
                  </div>
                  <button
                    onClick={closeModal}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                {/* Room Info */}
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Home className="text-blue-600" size={20} />
                        </div>
                        <span className="text-sm text-gray-600">Chủ trọ</span>
                      </div>
                      <p className="font-semibold text-gray-900">{selectedRoom.landlordId.name}</p>
                      <p className="text-sm text-gray-600">{selectedRoom.landlordId.email}</p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <User className="text-green-600" size={20} />
                        </div>
                        <span className="text-sm text-gray-600">Người thuê</span>
                      </div>
                      {selectedRoom.tenantId ? (
                        <>
                          <p className="font-semibold text-gray-900">{selectedRoom.tenantId.name}</p>
                          <p className="text-sm text-gray-600">{selectedRoom.tenantId.email}</p>
                        </>
                      ) : (
                        <p className="text-gray-400">Chưa có người thuê</p>
                      )}
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-orange-100 rounded-lg">
                          <Zap className="text-orange-600" size={20} />
                        </div>
                        <span className="text-sm text-gray-600">Tổng tiêu thụ</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{totalConsumption.toFixed(1)}</p>
                      <p className="text-sm text-gray-600">kWh</p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
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
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Lịch Sử Nhập Chỉ Số</h3>
                    
                    {roomReadings.length === 0 ? (
                      <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
                        Chưa có dữ liệu chỉ số điện
                      </div>
                    ) : (
                      <div className="overflow-x-auto border border-gray-200 rounded-lg">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Ngày</th>
                              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Người nhập</th>
                              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Chỉ số</th>
                              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Tiêu thụ</th>
                              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Chi phí</th>
                              <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Phương thức</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {roomReadings.map((reading) => (
                              <tr key={reading._id} className="hover:bg-gray-50">
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
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
