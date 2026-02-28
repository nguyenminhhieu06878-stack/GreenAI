import { useEffect, useState } from 'react'
import { Search, User, X, Calendar, Zap, DollarSign } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import api from '@/lib/api'
import toast from 'react-hot-toast'

interface Reading {
  _id: string
  value: number
  consumption: number
  cost: number
  createdAt: string
  roomId: {
    _id: string
    name: string
    address?: string
  }
  method: string
}

export default function AdminTenants() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [unassignedTenants, setUnassignedTenants] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedTenant, setSelectedTenant] = useState<any>(null)
  const [tenantReadings, setTenantReadings] = useState<Reading[]>([])
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    fetchUnassignedTenants()
  }, [search])

  useEffect(() => {
    // Check if tenantId is in URL query
    const tenantId = searchParams.get('tenantId')
    if (tenantId) {
      viewTenantDetail(tenantId)
      // Clear the query param after opening modal
      setSearchParams({})
    }
  }, [searchParams])

  const fetchUnassignedTenants = async () => {
    try {
      const params: any = { role: 'tenant' }
      if (search) params.search = search

      const [usersResponse, roomsResponse] = await Promise.all([
        api.get('/admin/users', { params }),
        api.get('/admin/rooms')
      ])
      
      // Get list of tenant IDs that are assigned to rooms
      const assignedTenantIds = roomsResponse.data.rooms
        .filter((room: any) => room.tenantId)
        .map((room: any) => room.tenantId._id)
      
      // Filter out tenants that are already assigned
      const unassigned = usersResponse.data.users.filter(
        (tenant: any) => !assignedTenantIds.includes(tenant._id)
      )
      
      setUnassignedTenants(unassigned)
    } catch (error: any) {
      toast.error('Không thể tải danh sách người thuê')
    } finally {
      setLoading(false)
    }
  }

  const viewTenantDetail = async (tenantId: string) => {
    setLoadingDetail(true)
    try {
      // First try to get tenant from unassigned list
      let tenant = unassignedTenants.find(t => t._id === tenantId)
      
      // If not found, fetch all users and find the tenant
      if (!tenant) {
        const usersResponse = await api.get('/admin/users', { params: { role: 'tenant' } })
        tenant = usersResponse.data.users.find((u: any) => u._id === tenantId)
      }
      
      if (!tenant) {
        toast.error('Không tìm thấy người thuê')
        return
      }
      
      setSelectedTenant(tenant)
      
      // Fetch readings
      const response = await api.get(`/admin/tenants/${tenantId}/readings`)
      setTenantReadings(response.data.readings || [])
    } catch (error: any) {
      toast.error('Không thể tải chi tiết cá nhân')
    } finally {
      setLoadingDetail(false)
    }
  }

  const closeModal = () => {
    setSelectedTenant(null)
    setTenantReadings([])
  }

  if (loading) return <div className="flex items-center justify-center h-64">Đang tải...</div>

  const totalConsumption = tenantReadings.reduce((sum, r) => sum + r.consumption, 0)
  const totalCost = tenantReadings.reduce((sum, r) => sum + r.cost, 0)

  // Pagination
  const totalPages = Math.ceil(unassignedTenants.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentTenants = unassignedTenants.slice(startIndex, endIndex)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold">Cá Nhân</h2>
      </div>

      <div className="bg-white rounded-xl p-3 sm:p-4 border border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Tìm kiếm cá nhân..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      {/* Unassigned Tenants List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Người dùng</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Vai trò</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {unassignedTenants.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    {search ? 'Không tìm thấy cá nhân nào' : 'Chưa có cá nhân nào'}
                  </td>
                </tr>
              ) : (
                currentTenants.map((tenant) => (
                  <tr key={tenant._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">{tenant.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{tenant.email}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                        Người thuê
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => viewTenantDetail(tenant._id)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Xem chi tiết
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {unassignedTenants.length > itemsPerPage && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Hiển thị {startIndex + 1}-{Math.min(endIndex, unassignedTenants.length)} trong tổng số {unassignedTenants.length} cá nhân
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

      {/* Tenant Detail Modal */}
      {selectedTenant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            {loadingDetail ? (
              <div className="flex items-center justify-center h-64">Đang tải...</div>
            ) : (
              <>
                {/* Modal Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-xl">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedTenant.name}</h2>
                    <p className="text-gray-600">{selectedTenant.email}</p>
                  </div>
                  <button
                    onClick={closeModal}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                {/* Modal Content */}
                <div className="p-6 space-y-6">
                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <User className="text-blue-600" size={20} />
                        </div>
                        <span className="text-sm text-gray-600">Vai trò</span>
                      </div>
                      <p className="font-semibold text-gray-900">Người thuê</p>
                      <p className="text-sm text-gray-600">Cá nhân</p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Calendar className="text-green-600" size={20} />
                        </div>
                        <span className="text-sm text-gray-600">Ngày tạo</span>
                      </div>
                      <p className="font-semibold text-gray-900">
                        {new Date(selectedTenant.createdAt).toLocaleDateString('vi-VN')}
                      </p>
                      <p className="text-sm text-gray-600">Tài khoản</p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-orange-100 rounded-lg">
                          <Zap className="text-orange-600" size={20} />
                        </div>
                        <span className="text-sm text-gray-600">Tổng tiêu thụ</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{totalConsumption.toFixed(1)}</p>
                      <p className="text-sm text-gray-600">kWh</p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <DollarSign className="text-purple-600" size={20} />
                        </div>
                        <span className="text-sm text-gray-600">Tổng chi phí</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{totalCost.toLocaleString('vi-VN')}</p>
                      <p className="text-sm text-gray-600">đồng</p>
                    </div>
                  </div>

                  {/* Readings History */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Lịch Sử Nhập Chỉ Số</h3>
                    
                    {tenantReadings.length === 0 ? (
                      <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
                        Chưa có dữ liệu chỉ số điện
                      </div>
                    ) : (
                      <div className="overflow-x-auto border border-gray-200 rounded-lg">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Ngày</th>
                              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Chỉ số</th>
                              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Tiêu thụ</th>
                              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Chi phí</th>
                              <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Phương thức</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {tenantReadings.map((reading) => (
                              <tr key={reading._id} className="hover:bg-gray-50">
                                <td className="py-3 px-4 text-sm text-gray-900">
                                  {new Date(reading.createdAt).toLocaleDateString('vi-VN')}
                                </td>
                                <td className="py-3 px-4 text-sm text-right font-semibold text-gray-900">
                                  {reading.value}
                                </td>
                                <td className="py-3 px-4 text-sm text-right text-gray-900">
                                  {reading.consumption.toFixed(1)} kWh
                                </td>
                                <td className="py-3 px-4 text-sm text-right font-semibold text-green-600">
                                  {reading.cost.toLocaleString('vi-VN')} đ
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                    reading.method === 'auto'
                                      ? 'bg-blue-100 text-blue-700'
                                      : 'bg-gray-100 text-gray-700'
                                  }`}>
                                    {reading.method === 'auto' ? 'Tự động' : 'Thủ công'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
