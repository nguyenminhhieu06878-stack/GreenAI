import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { useRoomStore } from '@/stores/roomStore'
import toast from 'react-hot-toast'

export const useAnalytics = () => {
  const { selectedRoom, setSelectedRoom } = useRoomStore()
  const roomId = selectedRoom?._id

  const handleError = (error: any) => {
    if (error.response?.status === 403) {
      // User no longer has access to this room, clear selection
      setSelectedRoom(null)
      toast.error('Bạn không còn quyền truy cập phòng này')
      return null
    }
    throw error
  }

  const { data: dashboardStats, isLoading: loadingStats } = useQuery({
    queryKey: ['dashboard-stats', roomId],
    queryFn: async () => {
      try {
        const params = roomId ? { roomId } : {}
        const response = await api.get('/analytics/dashboard', { params })
        return response.data
      } catch (error) {
        return handleError(error)
      }
    },
    retry: false
  })

  const { data: consumptionData, isLoading: loadingConsumption } = useQuery({
    queryKey: ['consumption-chart', roomId],
    queryFn: async () => {
      try {
        const params: any = { type: 'daily', limit: 7 }
        if (roomId) params.roomId = roomId
        const response = await api.get('/analytics/consumption', { params })
        return response.data.data
      } catch (error) {
        return handleError(error)
      }
    },
    retry: false
  })

  const { data: tips, isLoading: loadingTips } = useQuery({
    queryKey: ['tips', roomId],
    queryFn: async () => {
      const response = await api.get('/analytics/tips')
      return response.data.tips
    }
  })

  return {
    dashboardStats,
    consumptionData,
    tips,
    isLoading: loadingStats || loadingConsumption || loadingTips
  }
}
