import { Award, Trophy, Star, Zap, Target, TrendingUp } from 'lucide-react'
import { useAnalytics } from '@/hooks/useAnalytics'
import { useMeterReading } from '@/hooks/useMeterReading'
import { useAuthStore } from '@/stores/authStore'

interface Achievement {
  id: string
  title: string
  description: string
  icon: any
  progress: number
  total: number
  unlocked: boolean
  color: string
}

export default function Achievements() {
  const { dashboardStats } = useAnalytics()
  const { readings } = useMeterReading()
  const { user } = useAuthStore()

  const totalReadings = dashboardStats?.totalReadings || 0
  const monthlyConsumption = dashboardStats?.monthlyConsumption || 0
  const monthlyGoal = user?.monthlyGoal || 0
  const daysTracked = readings?.length || 0

  const achievements: Achievement[] = [
    {
      id: 'first-reading',
      title: 'Bước Đầu Tiên',
      description: 'Ghi nhận chỉ số điện lần đầu tiên',
      icon: Star,
      progress: Math.min(totalReadings, 1),
      total: 1,
      unlocked: totalReadings >= 1,
      color: 'from-yellow-400 to-yellow-600'
    },
    {
      id: 'consistent-tracker',
      title: 'Người Theo Dõi Kiên Định',
      description: 'Ghi nhận chỉ số điện 5 lần',
      icon: Target,
      progress: Math.min(totalReadings, 5),
      total: 5,
      unlocked: totalReadings >= 5,
      color: 'from-blue-400 to-blue-600'
    },
    {
      id: 'energy-master',
      title: 'Chuyên Gia Năng Lượng',
      description: 'Ghi nhận chỉ số điện 10 lần',
      icon: Trophy,
      progress: Math.min(totalReadings, 10),
      total: 10,
      unlocked: totalReadings >= 10,
      color: 'from-purple-400 to-purple-600'
    },
    {
      id: 'green-saver',
      title: 'Green Saver',
      description: 'Tiết kiệm điện dưới mục tiêu hàng tháng',
      icon: Award,
      progress: monthlyGoal > 0 && monthlyConsumption <= monthlyGoal ? 1 : 0,
      total: 1,
      unlocked: monthlyGoal > 0 && monthlyConsumption <= monthlyGoal,
      color: 'from-green-400 to-green-600'
    },
    {
      id: 'week-warrior',
      title: 'Chiến Binh Tuần Lễ',
      description: 'Theo dõi điện năng liên tục 7 ngày',
      icon: Zap,
      progress: Math.min(daysTracked, 7),
      total: 7,
      unlocked: daysTracked >= 7,
      color: 'from-orange-400 to-orange-600'
    },
    {
      id: 'efficiency-expert',
      title: 'Chuyên Gia Hiệu Suất',
      description: 'Duy trì mức tiêu thụ thấp trong 30 ngày',
      icon: TrendingUp,
      progress: Math.min(daysTracked, 30),
      total: 30,
      unlocked: daysTracked >= 30,
      color: 'from-teal-400 to-teal-600'
    }
  ]

  const unlockedCount = achievements.filter(a => a.unlocked).length
  const totalAchievements = achievements.length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-50 via-blue-50 to-green-50 rounded-2xl p-8 border border-green-200">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
            <Trophy className="text-white" size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Thành Tích Của Bạn</h1>
            <p className="text-gray-600">
              Đã mở khóa {unlockedCount}/{totalAchievements} thành tích
            </p>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Tiến độ hoàn thành</span>
            <span>{Math.round((unlockedCount / totalAchievements) * 100)}%</span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-500"
              style={{ width: `${(unlockedCount / totalAchievements) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {achievements.map((achievement) => {
          const Icon = achievement.icon
          const progressPercent = (achievement.progress / achievement.total) * 100

          return (
            <div
              key={achievement.id}
              className={`bg-white rounded-xl p-6 border-2 transition-all ${
                achievement.unlocked
                  ? 'border-green-300 shadow-lg'
                  : 'border-gray-200 opacity-75'
              }`}
            >
              {/* Icon */}
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-16 h-16 bg-gradient-to-br ${achievement.color} rounded-full flex items-center justify-center ${
                    !achievement.unlocked && 'grayscale opacity-50'
                  }`}
                >
                  <Icon className="text-white" size={32} />
                </div>
                {achievement.unlocked && (
                  <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                    Đã mở khóa
                  </div>
                )}
              </div>

              {/* Title & Description */}
              <h3 className="font-bold text-lg text-gray-900 mb-2">
                {achievement.title}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {achievement.description}
              </p>

              {/* Progress */}
              <div>
                <div className="flex justify-between text-xs text-gray-600 mb-2">
                  <span>Tiến độ</span>
                  <span>
                    {achievement.progress}/{achievement.total}
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${achievement.color} transition-all duration-500`}
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Stats Summary */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Thống Kê Tổng Quan</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-3xl font-bold text-blue-600">{totalReadings}</p>
            <p className="text-sm text-gray-600 mt-1">Lần ghi nhận</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-3xl font-bold text-green-600">{unlockedCount}</p>
            <p className="text-sm text-gray-600 mt-1">Thành tích</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-3xl font-bold text-purple-600">{daysTracked}</p>
            <p className="text-sm text-gray-600 mt-1">Ngày theo dõi</p>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <p className="text-3xl font-bold text-orange-600">
              {monthlyConsumption.toFixed(0)}
            </p>
            <p className="text-sm text-gray-600 mt-1">kWh tháng này</p>
          </div>
        </div>
      </div>
    </div>
  )
}
