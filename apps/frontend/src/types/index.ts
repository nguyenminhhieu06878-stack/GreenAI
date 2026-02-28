export interface User {
  id: string
  email: string
  name: string
  role: 'tenant' | 'landlord' | 'admin'
  subscriptionPlan?: string
  subscriptionExpiry?: string
}

export interface MeterReading {
  id: string
  userId: string
  value: number
  imagePath?: string
  method: 'auto' | 'manual'
  createdAt: Date
}

export interface ConsumptionData {
  date: string
  value: number
  cost?: number
}

export interface Tip {
  id: string
  title: string
  description: string
  savings: string
  category: string
}

export interface DashboardStats {
  todayConsumption: number
  monthlyEstimate: number
  estimatedCost: number
  savings: number
  savingsGoal: number
}
