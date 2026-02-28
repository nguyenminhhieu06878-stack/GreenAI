import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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

interface RoomStore {
  selectedRoom: Room | null
  setSelectedRoom: (room: Room | null) => void
  clearSelectedRoom: () => void
}

export const useRoomStore = create<RoomStore>()(
  persist(
    (set) => ({
      selectedRoom: null,
      setSelectedRoom: (room) => set({ selectedRoom: room }),
      clearSelectedRoom: () => set({ selectedRoom: null })
    }),
    {
      name: 'room-storage'
    }
  )
)
