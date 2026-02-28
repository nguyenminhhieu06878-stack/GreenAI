import { useEffect, useState } from 'react'
import { DollarSign, TrendingUp, Users, CreditCard } from 'lucide-react'
import api from '@/lib/api'
import toast from 'react-hot-toast'

export default function AdminRevenue() {
  const [subscriptions, setSubscriptions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    fetchSubscriptions()
  }, [])

  const fetchSubscriptions = async () => {
    try {
      const response = await api.get('/subscriptions/all')
      setSubscriptions(response.data.subscriptions)
    } catch (error: any) {
      toast.error('Không thể tải dữ liệu giao dịch')
    } finally {
      setLoading(false)
    }
  }

  const totalRevenue = subscriptions
    .filter(s => s.status === 'active')
    .reduce((sum, s) => sum + s.planPrice, 0)
  
  const activeSubscriptions = subscriptions.filter(s => s.status === 'active').length
  const expiredSubscriptions = subscriptions.filter(s => s.status === 'expired').length
  const totalCustomers = new Set(subscriptions.filter(s => s.userId).map(s => s.userId._id)).size

  // Pagination
  const totalPages = Math.ceil(subscriptions.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentSubscriptions = subscriptions.slice(startIndex, endIndex)

  const goToPage = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-700',
      expired: 'bg-gray-100 text-gray-700',
      cancelled: 'bg-red-100 text-red-700'
    }
    const names = {
      active: 'Đang hoạt động',
      expired: 'Hết hạn',
      cancelled: 'Đã hủy'
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[status as keyof typeof styles]}`}>
        {names[status as keyof typeof names]}
      </span>
    )
  }

  if (loading) return <div className="flex items-center justify-center h-64">Đang tải...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Quản Lý Doanh Thu</h2>
        <div className="text-right">
          <p className="text-sm text-gray-600">Tổng doanh thu tích lũy</p>
          <p className="text-3xl font-bold text-primary-600">
            {subscriptions.reduce((sum, s) => sum + s.planPrice, 0).toLocaleString('vi-VN')} đ
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600">Tổng Doanh Thu</p>
            <DollarSign className="h-4 w-4 text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {totalRevenue.toLocaleString('vi-VN')} đ
          </p>
          <p className="text-xs text-gray-500 mt-1">Từ gói dịch vụ đang hoạt động</p>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600">Gói Đang Hoạt Động</p>
            <TrendingUp className="h-4 w-4 text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{activeSubscriptions}</p>
          <p className="text-xs text-gray-500 mt-1">Đang sử dụng dịch vụ</p>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600">Gói Hết Hạn</p>
            <CreditCard className="h-4 w-4 text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{expiredSubscriptions}</p>
          <p className="text-xs text-gray-500 mt-1">Cần gia hạn</p>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600">Khách Hàng Trả Phí</p>
            <Users className="h-4 w-4 text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalCustomers}</p>
          <p className="text-xs text-gray-500 mt-1">Khách hàng đã mua gói</p>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Giao Dịch Gần Đây</h3>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Khách hàng</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Gói dịch vụ</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Số tiền</th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Phương thức</th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Trạng thái</th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Thời gian</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {currentSubscriptions.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  Chưa có giao dịch nào
                </td>
              </tr>
            ) : (
              currentSubscriptions.map((subscription) => (
                <tr key={subscription._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{subscription.userId?.name || 'N/A'}</div>
                    <div className="text-sm text-gray-500">{subscription.userId?.email || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{subscription.planName}</td>
                  <td className="px-6 py-4 text-right font-semibold text-gray-900">
                    {subscription.planPrice.toLocaleString('vi-VN')} đ
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-gray-600">
                    {subscription.paymentMethod}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {getStatusBadge(subscription.status)}
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-gray-600">
                    {new Date(subscription.createdAt).toLocaleString('vi-VN')}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 bg-white border-t border-gray-200">
          <div className="text-sm text-gray-700">
            Hiển thị {startIndex + 1} - {Math.min(endIndex, subscriptions.length)} trong tổng số {subscriptions.length} giao dịch
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Trước
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => goToPage(page)}
                className={`px-3 py-1 border rounded ${
                  currentPage === page
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sau
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
