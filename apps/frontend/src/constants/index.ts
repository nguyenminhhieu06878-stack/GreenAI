export const APP_NAME = 'GreenEnergy AI'

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/trang-chu',
  ENERGY_CONSUMPTION: '/bieu-do-tieu-thu',
  METER_READING: '/nhap-chi-so',
  TIPS: '/meo-tiet-kiem',
  PRICING: '/bang-gia'
} as const

export const ROLES = {
  TENANT: 'tenant',
  LANDLORD: 'landlord',
  ADMIN: 'admin'
} as const

export const SUBSCRIPTION_PLANS = {
  FREE: 'free',
  PERSONAL: 'personal',
  LANDLORD: 'landlord'
} as const

export const CHART_COLORS = {
  PRIMARY: '#22c55e',
  SECONDARY: '#3b82f6',
  WARNING: '#f59e0b',
  DANGER: '#ef4444',
  INFO: '#06b6d4'
} as const

export const ELECTRICITY_PRICE_PER_KWH = 2500 // VND
