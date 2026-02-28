import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { useRoomStore } from '@/stores/roomStore'

export const useMeterReading = () => {
  const queryClient = useQueryClient()
  const { selectedRoom } = useRoomStore()
  const roomId = selectedRoom?._id

  const { data: readings, isLoading } = useQuery({
    queryKey: ['meter-readings', roomId],
    queryFn: async () => {
      const params = roomId ? { roomId } : {}
      const response = await api.get('/meter/readings', { params })
      return response.data.readings
    }
  })

  const uploadImage = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append('image', file)
      if (roomId) {
        formData.append('roomId', roomId)
      }
      const response = await api.post('/meter/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meter-readings'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      queryClient.invalidateQueries({ queryKey: ['consumption-chart'] })
    }
  })

  const addManualReading = useMutation({
    mutationFn: async ({ value, date }: { value: number; date?: string }) => {
      const payload: any = { value, date }
      if (roomId) {
        payload.roomId = roomId
      }
      const response = await api.post('/meter/manual', payload)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meter-readings'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      queryClient.invalidateQueries({ queryKey: ['consumption-chart'] })
    }
  })

  return {
    readings,
    isLoading,
    uploadImage: uploadImage.mutateAsync,
    addManualReading: (value: number, date?: string) => addManualReading.mutateAsync({ value, date }),
    isUploading: uploadImage.isPending,
    isAdding: addManualReading.isPending
  }
}
