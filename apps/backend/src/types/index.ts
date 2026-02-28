export interface User {
  id: string
  email: string
  password: string
  name: string
  role: 'tenant' | 'landlord' | 'admin'
  createdAt: Date
  subscriptionExpiry?: Date
}

export interface MeterReading {
  id: string
  userId: string
  value: number
  imagePath?: string
  method: 'auto' | 'manual'
  createdAt: Date
}

export interface Room {
  id: string
  landlordId: string
  name: string
  tenantId?: string
  createdAt: Date
}

export interface Subscription {
  id: string
  userId: string
  plan: 'free' | 'personal' | 'landlord'
  startDate: Date
  endDate: Date
  status: 'active' | 'expired' | 'cancelled'
}
