import { useState, useEffect } from 'react'
import { ChevronDown, Home, X } from 'lucide-react'
import { useRoomStore } from '@/stores/roomStore'
import { useAuthStore } from '@/stores/authStore'
import api from '@/lib/api'

interface Room {
  _id: string
  name: string
  address?: string
  electricityRate: number
  status: string
  tenantId?: {
    _id: string
    name: string
    email: string
  }
}

export default function RoomSelector() {
  const { user } = useAuthStore()
  const { selectedRoom, setSelectedRoom, clearSelectedRoom } = useRoomStore()
  const [rooms, setRooms] = useState<Room[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.role === 'landlord') {
      fetchRooms()
    } else if (user?.role === 'tenant') {
      fetchTenantRoom()
    }
  }, [user])

  const fetchRooms = async () => {
    try {
      const response = await api.get('/rooms')
      setRooms(response.data.rooms)
      
      // Auto-select first room if none selected
      if (!selectedRoom && response.data.rooms.length > 0) {
        setSelectedRoom(response.data.rooms[0])
      }
    } catch (error) {
      console.error('Failed to fetch rooms:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTenantRoom = async () => {
    try {
      const response = await api.get('/rooms')
      setRooms(response.data.rooms)
      
      // Auto-select tenant's room
      if (response.data.rooms.length > 0) {
        setSelectedRoom(response.data.rooms[0])
      }
    } catch (error) {
      console.error('Failed to fetch room:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectRoom = (room: Room) => {
    setSelectedRoom(room)
    setShowDropdown(false)
  }

  const handleClearRoom = (e: React.MouseEvent) => {
    e.stopPropagation()
    clearSelectedRoom()
    setShowDropdown(false)
  }

  if (loading) {
    return (
      <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-primary-700 rounded-lg text-xs sm:text-sm">
        <Home size={14} className="sm:w-4 sm:h-4" />
        <span className="hidden sm:inline">Đang tải...</span>
      </div>
    )
  }

  if (rooms.length === 0) {
    return null
  }

  // Tenant only has one room, no need for dropdown
  if (user?.role === 'tenant') {
    return (
      <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-primary-700 rounded-lg text-xs sm:text-sm">
        <Home size={14} className="sm:w-4 sm:h-4" />
        <span className="hidden md:inline truncate max-w-[120px]">{selectedRoom?.name || 'Phòng của tôi'}</span>
      </div>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-primary-700 rounded-lg hover:bg-primary-800 transition-colors text-xs sm:text-sm whitespace-nowrap"
      >
        <Home size={14} className="sm:w-4 sm:h-4 flex-shrink-0" />
        <span className="truncate max-w-[80px] sm:max-w-[120px] md:max-w-[150px]">
          {selectedRoom ? selectedRoom.name : 'Tất cả phòng'}
        </span>
        <ChevronDown size={14} className="sm:w-4 sm:h-4 flex-shrink-0" />
      </button>
      
      {selectedRoom && (
        <button
          onClick={handleClearRoom}
          className="absolute -top-1 -right-1 bg-primary-600 hover:bg-primary-700 rounded-full p-0.5 sm:p-1 text-white shadow-md"
          title="Xem tất cả"
        >
          <X size={10} className="sm:w-3 sm:h-3" />
        </button>
      )}

      {showDropdown && (
        <>
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setShowDropdown(false)}
          />
          
          {/* Dropdown menu */}
          <div className="absolute right-0 mt-2 w-[280px] sm:w-72 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[70vh] sm:max-h-96 overflow-y-auto">
            <div className="p-2 sm:p-3">
              {/* Header - mobile only */}
              <div className="sm:hidden flex items-center justify-between mb-2 pb-2 border-b border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900">Chọn phòng</h3>
                <button
                  onClick={() => setShowDropdown(false)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* All rooms option */}
              <button
                onClick={() => {
                  clearSelectedRoom()
                  setShowDropdown(false)
                }}
                className={`w-full text-left px-3 py-2.5 sm:py-2 rounded-lg hover:bg-gray-100 transition-colors text-sm ${
                  !selectedRoom ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'text-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Home size={16} className="flex-shrink-0" />
                  <span>Tất cả phòng</span>
                </div>
              </button>
              
              <div className="border-t border-gray-200 my-2" />
              
              {/* Room list */}
              {rooms.map((room) => (
                <button
                  key={room._id}
                  onClick={() => handleSelectRoom(room)}
                  className={`w-full text-left px-3 py-2.5 sm:py-2 rounded-lg hover:bg-gray-100 transition-colors text-sm ${
                    selectedRoom?._id === room._id
                      ? 'bg-emerald-50 text-emerald-700 font-semibold'
                      : 'text-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{room.name}</p>
                      {room.tenantId && (
                        <p className="text-xs text-gray-500 truncate">{room.tenantId.name}</p>
                      )}
                    </div>
                    {!room.tenantId && (
                      <span className="text-xs text-gray-400 flex-shrink-0">Trống</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
