import { useEffect, useState } from 'react'
import api from '@/lib/api'
import toast from 'react-hot-toast'

export default function AdminReadings() {
  const [readings, setReadings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [recalculating, setRecalculating] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    fetchReadings()
  }, [])

  const fetchReadings = async () => {
    try {
      const response = await api.get('/admin/readings', { params: { limit: 100 } })
      setReadings(response.data.readings)
    } catch (error: any) {
      toast.error('Không thể tải danh sách chỉ số')
    } finally {
      setLoading(false)
    }
  }

  const handleRecalculate = async () => {
    if (!confirm('Bạn có chắc muốn tính lại tiêu thụ cho tất cả chỉ số? Thao tác này có thể mất vài giây.')) {
      return
    }

    setRecalculating(true)
    try {
      const response = await api.post('/admin/recalculate-consumption')
      toast.success(response.data.message + ` (${response.data.updatedCount} chỉ số)`)
      await fetchReadings()
    } catch (error: any) {
      toast.error('Không thể tính lại tiêu thụ')
    } finally {
      setRecalculating(false)
    }
  }

  const getRoleBadge = (role: string) => {
    const styles = {
      admin: 'bg-red-100 text-red-700',
      landlord: 'bg-purple-100 text-purple-700',
      tenant: 'bg-green-100 text-green-700'
    }
    const names = { admin: 'Admin', landlord: 'Chủ trọ', tenant: 'Người thuê' }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[role as keyof typeof styles]}`}>
        {names[role as keyof typeof names]}
      </span>
    )
  }

  if (loading) return <div className="flex items-center justify-center h-64">Đang tải...</div>

  // Pagination
  const totalPages = Math.ceil(readings.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentReadings = readings.slice(startIndex, endIndex)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Quản Lý Chỉ Số Điện</h2>
        <button
          onClick={handleRecalculate}
          disabled={recalculating}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {recalculating ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Đang tính...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Tính lại tiêu thụ
            </>
          )}
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Ngày</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Người nhập</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Phòng</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Chỉ số</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Tiêu thụ</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Chi phí</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {currentReadings.map((reading) => (
              <tr key={reading._id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm">
                  {new Date(reading.createdAt).toLocaleDateString('vi-VN')}
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm font-medium">{reading.userId.name}</div>
                  <div className="mt-1">{getRoleBadge(reading.userId.role)}</div>
                </td>
                <td className="px-4 py-3 text-sm">{reading.roomId?.name || '-'}</td>
                <td className="px-4 py-3 text-sm text-right font-semibold">
                  {reading.value.toFixed(1)} kWh
                </td>
                <td className="px-4 py-3 text-sm text-right">
                  {reading.consumption > 0 ? `${reading.consumption.toFixed(1)} kWh` : '-'}
                </td>
                <td className="px-4 py-3 text-sm text-right font-semibold text-green-600">
                  {reading.cost > 0 ? `${reading.cost.toLocaleString('vi-VN')} đ` : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {readings.length > itemsPerPage && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Hiển thị {startIndex + 1}-{Math.min(endIndex, readings.length)} trong tổng số {readings.length} chỉ số
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Trước
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-4 py-2 border rounded-lg ${
                    currentPage === page
                      ? 'bg-green-600 text-white border-green-600'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sau
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
