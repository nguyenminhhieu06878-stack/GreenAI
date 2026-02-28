import { useEffect, useState } from 'react'
import { Users, Home, DollarSign, CreditCard } from 'lucide-react'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/stats')
      setStats(response.data)
    } catch (error: any) {
      toast.error('Không thể tải thống kê')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64">Đang tải...</div>
  if (!stats) return <div className="text-center text-gray-600">Không có dữ liệu</div>

  const dashboardStats = [
    {
      title: 'Tổng Doanh Thu',
      value: `${((stats.revenue?.total || 0) / 1000).toFixed(0)}k đ`,
      description: `Từ bán gói dịch vụ`,
      icon: DollarSign,
    },
    {
      title: 'Gói Đang Hoạt Động',
      value: stats.subscriptions.active,
      description: `Doanh thu: ${((stats.subscriptions.revenue || 0) / 1000).toFixed(0)}k đ`,
      icon: CreditCard,
    },
    {
      title: 'Tổng Người Dùng',
      value: stats.users.total,
      description: `${stats.users.landlords} chủ trọ • ${stats.users.tenants} người thuê`,
      icon: Users,
    },
    {
      title: 'Tổng Phòng',
      value: stats.rooms.total,
      description: `${stats.rooms.occupied} đã thuê • ${stats.rooms.vacant} trống`,
      icon: Home,
    },
  ]

  const chartData = stats.monthlyStats.map((item: any) => ({
    name: new Date(item._id).toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' }),
    revenue: item.revenue
  }))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-8">
          {[
            { key: 'overview', label: 'Tổng Quan' },
            { key: 'analytics', label: 'Phân Tích' },
            { key: 'reports', label: 'Báo Cáo' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.key
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-4">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {dashboardStats.map((stat, index) => (
              <div key={index} className="bg-white rounded-lg p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <stat.icon className="h-4 w-4 text-gray-400" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
              </div>
            ))}
          </div>

          {/* Charts and Recent Sales */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            {/* Revenue Chart */}
            <div className="bg-white rounded-lg p-6 border border-gray-200 col-span-4">
              <div className="mb-4">
                <h3 className="text-lg font-semibold">Doanh Thu 30 Ngày</h3>
                <p className="text-sm text-gray-500">Doanh thu từ bán gói dịch vụ</p>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Recent Subscriptions */}
            <div className="bg-white rounded-lg p-6 border border-gray-200 col-span-3">
              <div className="mb-4">
                <h3 className="text-lg font-semibold">Giao Dịch Gần Đây</h3>
                <p className="text-sm text-gray-500">Các gói dịch vụ mới nhất</p>
              </div>
              <div className="space-y-4">
                {stats.recentActivities.slice(0, 5).map((activity: any) => (
                  <div key={activity._id} className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {activity.userId?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {activity.userId?.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {activity.planName}
                      </p>
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                      +{(activity.planPrice / 1000).toFixed(0)}k đ
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Subscription Stats */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Thống Kê Gói Dịch Vụ</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-sm text-gray-600">Gói Đang Hoạt Động</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.subscriptions.active}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Doanh Thu Gói/Tháng</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {((stats.subscriptions.revenue || 0) / 1000).toFixed(0)}k đ
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Tỷ Lệ Chuyển Đổi</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.users.total > 0 ? ((stats.subscriptions.active / stats.users.total) * 100).toFixed(1) : 0}%
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-4">
          {/* User Growth */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Phân Tích Người Dùng</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-600 font-medium">Tổng Người Dùng</p>
                <p className="text-3xl font-bold text-blue-900 mt-2">{stats.users.total}</p>
                <p className="text-xs text-blue-600 mt-1">
                  {stats.users.landlords} chủ trọ • {stats.users.tenants} người thuê
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-green-600 font-medium">Người Dùng Trả Phí</p>
                <p className="text-3xl font-bold text-green-900 mt-2">{stats.subscriptions.active}</p>
                <p className="text-xs text-green-600 mt-1">
                  {stats.users.total > 0 ? ((stats.subscriptions.active / stats.users.total) * 100).toFixed(1) : 0}% tỷ lệ chuyển đổi
                </p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-purple-600 font-medium">Phòng Đang Hoạt Động</p>
                <p className="text-3xl font-bold text-purple-900 mt-2">{stats.rooms.occupied}</p>
                <p className="text-xs text-purple-600 mt-1">
                  {stats.rooms.total > 0 ? ((stats.rooms.occupied / stats.rooms.total) * 100).toFixed(1) : 0}% tỷ lệ lấp đầy
                </p>
              </div>
            </div>
          </div>

          {/* Revenue Breakdown */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Phân Tích Doanh Thu</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-sm text-gray-600">Doanh thu từ gói dịch vụ</span>
                  <span className="font-semibold">{((stats.subscriptions.revenue || 0) / 1000).toFixed(0)}k đ</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-sm text-gray-600">Trung bình/gói</span>
                  <span className="font-semibold">
                    {stats.subscriptions.active > 0 
                      ? ((stats.subscriptions.revenue / stats.subscriptions.active) / 1000).toFixed(0) 
                      : 0}k đ
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-sm text-gray-600">Tổng doanh thu</span>
                  <span className="font-semibold text-primary-600">
                    {((stats.revenue?.total || 0) / 1000).toFixed(0)}k đ
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Phân Bố Gói Dịch Vụ</h3>
              <div className="space-y-3">
                {stats.planDistribution?.map((plan: any) => (
                  <div key={plan._id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
                      <span className="text-sm text-gray-700">{plan._id || 'Chưa có gói'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">{plan.count} người</span>
                      <span className="text-xs text-gray-500">
                        ({stats.users.total > 0 ? ((plan.count / stats.users.total) * 100).toFixed(0) : 0}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="space-y-4">
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Báo Cáo Tổng Quan</h3>
            <div className="space-y-4">
              {/* Summary Report */}
              <div className="border-b pb-4">
                <h4 className="font-medium text-gray-900 mb-2">Tóm Tắt Hoạt Động</h4>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="flex justify-between p-3 bg-gray-50 rounded">
                    <span className="text-sm text-gray-600">Tổng người dùng đăng ký</span>
                    <span className="font-semibold">{stats.users.total}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-gray-50 rounded">
                    <span className="text-sm text-gray-600">Gói dịch vụ đang hoạt động</span>
                    <span className="font-semibold">{stats.subscriptions.active}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-gray-50 rounded">
                    <span className="text-sm text-gray-600">Tổng số phòng</span>
                    <span className="font-semibold">{stats.rooms.total}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-gray-50 rounded">
                    <span className="text-sm text-gray-600">Phòng đã cho thuê</span>
                    <span className="font-semibold">{stats.rooms.occupied}</span>
                  </div>
                </div>
              </div>

              {/* Financial Report */}
              <div className="border-b pb-4">
                <h4 className="font-medium text-gray-900 mb-2">Báo Cáo Tài Chính</h4>
                <div className="space-y-2">
                  <div className="flex justify-between p-3 bg-green-50 rounded">
                    <span className="text-sm text-green-700">Tổng doanh thu</span>
                    <span className="font-bold text-green-900">
                      {((stats.revenue?.total || 0)).toLocaleString('vi-VN')} đ
                    </span>
                  </div>
                  <div className="flex justify-between p-3 bg-blue-50 rounded">
                    <span className="text-sm text-blue-700">Doanh thu từ gói dịch vụ</span>
                    <span className="font-bold text-blue-900">
                      {((stats.subscriptions.revenue || 0)).toLocaleString('vi-VN')} đ
                    </span>
                  </div>
                  <div className="flex justify-between p-3 bg-purple-50 rounded">
                    <span className="text-sm text-purple-700">Doanh thu trung bình/người dùng</span>
                    <span className="font-bold text-purple-900">
                      {stats.users.total > 0 
                        ? ((stats.revenue?.total / stats.users.total)).toLocaleString('vi-VN')
                        : 0} đ
                    </span>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Chỉ Số Hiệu Suất</h4>
                <div className="grid gap-3 md:grid-cols-3">
                  <div className="p-4 border rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Tỷ lệ chuyển đổi</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.users.total > 0 
                        ? ((stats.subscriptions.active / stats.users.total) * 100).toFixed(1)
                        : 0}%
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Tỷ lệ lấp đầy phòng</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.rooms.total > 0 
                        ? ((stats.rooms.occupied / stats.rooms.total) * 100).toFixed(1)
                        : 0}%
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Số phòng/chủ trọ</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.users.landlords > 0 
                        ? (stats.rooms.total / stats.users.landlords).toFixed(1)
                        : 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
