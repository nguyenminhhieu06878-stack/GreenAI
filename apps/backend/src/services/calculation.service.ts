// Default electricity rate (VND per kWh) - can be overridden
const DEFAULT_ELECTRICITY_RATE = 3000

export class CalculationService {
  /**
   * Calculate electricity cost based on consumption using fixed rate
   * @param consumption - Amount of electricity consumed in kWh
   * @param electricityRate - Price per kWh (optional, defaults to 3000 VND)
   */
  static calculateCost(consumption: number, electricityRate?: number): number {
    const rate = electricityRate || DEFAULT_ELECTRICITY_RATE
    const totalCost = consumption * rate
    return Math.round(totalCost)
  }

  /**
   * Calculate consumption between two readings
   */
  static calculateConsumption(currentReading: number, previousReading: number): number {
    return Math.max(0, currentReading - previousReading)
  }

  /**
   * Calculate average daily consumption
   */
  static calculateDailyAverage(consumption: number, days: number): number {
    if (days <= 0) return 0
    return Math.round((consumption / days) * 100) / 100
  }

  /**
   * Calculate estimated monthly consumption
   */
  static estimateMonthlyConsumption(dailyAverage: number): number {
    return Math.round(dailyAverage * 30 * 100) / 100
  }

  /**
   * Calculate percentage change
   */
  static calculatePercentageChange(current: number, previous: number): number {
    if (previous === 0) return 0
    return Math.round(((current - previous) / previous) * 100)
  }

  /**
   * Get consumption level (low, medium, high)
   */
  static getConsumptionLevel(monthlyConsumption: number): 'low' | 'medium' | 'high' {
    if (monthlyConsumption < 100) return 'low'
    if (monthlyConsumption < 300) return 'medium'
    return 'high'
  }

  /**
   * Calculate days between two dates
   */
  static calculateDaysBetween(date1: Date, date2: Date): number {
    const diffTime = Math.abs(date2.getTime() - date1.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }
}
