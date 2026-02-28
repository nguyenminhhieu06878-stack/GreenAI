import { useState, useEffect } from 'react'
import { Gift, Plus, Edit2, Trash2, Package, Users, TrendingDown } from 'lucide-react'
import api from '@/lib/api'
import toast from 'react-hot-toast'

interface VoucherTemplate {
  _id: string
  name: string
  description: string
  value: string
  type: 'discount' | 'cashback' | 'gift'
  quantity: number
  remaining: number
  probability: number
  isActive: boolean
  validFrom?: string
  validUntil?: string
  createdAt: string
}

interface UserVoucher {
  _id: string
  userId: {
    _id: string
    name: string
    email: string
  }
  templateId?: {
    _id: string
    name: string
  }
  code: string
  value: string
  type: string
  isUsed: boolean
  usedAt?: string
  expiresAt: string
  createdAt: string
}

interface VoucherStats {
  totalTemplates: number
  activeTemplates: number
  totalQuantity: number
  remainingQuantity: number
  distributedVouchers: number
  usedVouchers: number
  unusedVouchers: number
}

export default function AdminVouchers() {
  const [templates, setTemplates] = useState<VoucherTemplate[]>([])
  const [userVouchers, setUserVouchers] = useState<UserVoucher[]>([])
  const [stats, setStats] = useState<VoucherStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'templates' | 'distributed'>('templates')
  const [showModal, setShowModal] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<VoucherTemplate | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    value: '',
    type: 'discount' as 'discount' | 'cashback' | 'gift',
    quantity: 10,
    probability: 10,
    validFrom: '',
    validUntil: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [templatesRes, statsRes, vouchersRes] = await Promise.all([
        api.get('/admin/voucher-templates'),
        api.get('/admin/voucher-stats'),
        api.get('/admin/vouchers')
      ])
      setTemplates(templatesRes.data.templates)
      setStats(statsRes.data.stats)
      setUserVouchers(vouchersRes.data.vouchers)
    } catch (error: any) {
      toast.error('Không thể tải dữ liệu')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingTemplate) {
        await api.put(`/admin/voucher-templates/${editingTemplate._id}`, formData)
        toast.success('Cập nhật voucher thành công!')
      } else {
        await api.post('/admin/voucher-templates', formData)
        toast.success('Tạo voucher thành công!')
      }
      setShowModal(false)
      resetForm()
      fetchData()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Có lỗi xảy ra')
    }
  }

  const handleEdit = (template: VoucherTemplate) => {
    setEditingTemplate(template)
    setFormData({
      name: template.name,
      description: template.description || '',
      value: template.value,
      type: template.type,
      quantity: template.quantity,
      probability: template.probability,
      validFrom: template.validFrom ? template.validFrom.split('T')[0] : '',
      validUntil: template.validUntil ? template.validUntil.split('T')[0] : ''
    })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa voucher này?')) return
    try {
      await api.delete(`/admin/voucher-templates/${id}`)
      toast.success('Đã xóa voucher')
      fetchData()
    } catch (error: any) {
      toast.error('Không thể xóa voucher')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      value: '',
      type: 'discount',
      quantity: 10,
      probability: 10,
      validFrom: '',
      validUntil: ''
    })
    setEditingTemplate(null)
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Đang tải...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản Lý Voucher</h1>
          <p className="text-gray-600 mt-1">Tạo và quản lý voucher cho người dùng</p>
        </div>
        <button
          onClick={() => {
            resetForm()
            setShowModal(true)
          }}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Tạo Voucher
        </button>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Package className="text-blue-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Tổng voucher</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalQuantity}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <Gift className="text-green-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Còn lại</p>
                <p className="text-2xl font-bold text-gray-900">{stats.remainingQuantity}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Users className="text-purple-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Đã phát</p>
                <p className="text-2xl font-bold text-gray-900">{stats.distributedVouchers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-100 rounded-lg">
                <TrendingDown className="text-orange-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Đã dùng</p>
                <p className="text-2xl font-bold text-gray-900">{stats.usedVouchers}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('templates')}
            className={`flex-1 px-6 py-3 font-medium transition-colors ${
              activeTab === 'templates'
                ? 'bg-green-50 text-green-700 border-b-2 border-green-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Quản Lý Voucher Template
          </button>
          <button
            onClick={() => setActiveTab('distributed')}
            className={`flex-1 px-6 py-3 font-medium transition-colors ${
              activeTab === 'distributed'
                ? 'bg-green-50 text-green-700 border-b-2 border-green-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Voucher Đã Phát ({userVouchers.length})
          </button>
        </div>

        {/* Templates Table */}
        {activeTab === 'templates' && (
          <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Giá trị</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loại</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số lượng</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Còn lại</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Xác suất</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {templates.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                    Chưa có voucher nào. Tạo voucher đầu tiên!
                  </td>
                </tr>
              ) : (
                templates.map((template) => (
                  <tr key={template._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-900">{template.name}</p>
                        {template.description && (
                          <p className="text-sm text-gray-500">{template.description}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-semibold text-green-600">{template.value}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        template.type === 'discount' ? 'bg-blue-100 text-blue-700' :
                        template.type === 'cashback' ? 'bg-green-100 text-green-700' :
                        'bg-purple-100 text-purple-700'
                      }`}>
                        {template.type === 'discount' ? 'Giảm giá' :
                         template.type === 'cashback' ? 'Hoàn tiền' : 'Quà tặng'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                      {template.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`font-semibold ${
                        template.remaining === 0 ? 'text-red-600' :
                        template.remaining < template.quantity * 0.2 ? 'text-orange-600' :
                        'text-green-600'
                      }`}>
                        {template.remaining}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                      {template.probability}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        template.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {template.isActive ? 'Hoạt động' : 'Tạm dừng'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(template)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(template._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        )}

        {/* Distributed Vouchers Table */}
        {activeTab === 'distributed' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã Voucher</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Người nhận</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Giá trị</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loại</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày nhận</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hết hạn</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {userVouchers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      Chưa có voucher nào được phát
                    </td>
                  </tr>
                ) : (
                  userVouchers.map((voucher) => (
                    <tr key={voucher._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-mono font-semibold text-gray-900">{voucher.code}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{voucher.userId?.name || 'N/A'}</p>
                          <p className="text-sm text-gray-500">{voucher.userId?.email || 'N/A'}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-semibold text-green-600">{voucher.value}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          voucher.type === 'random' ? 'bg-purple-100 text-purple-700' :
                          voucher.type === 'check-in' ? 'bg-blue-100 text-blue-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {voucher.type === 'random' ? 'Quay thưởng' :
                           voucher.type === 'check-in' ? 'Check-in' : 'Khuyến mãi'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {voucher.isUsed ? (
                          <div>
                            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                              Đã sử dụng
                            </span>
                            {voucher.usedAt && (
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(voucher.usedAt).toLocaleDateString('vi-VN')}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">
                            Chưa dùng
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(voucher.createdAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(voucher.expiresAt).toLocaleDateString('vi-VN')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingTemplate ? 'Chỉnh Sửa Voucher' : 'Tạo Voucher Mới'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên voucher *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="VD: Giảm 50k cho đơn đầu tiên"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    rows={2}
                    placeholder="Mô tả chi tiết về voucher"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giá trị *</label>
                  <input
                    type="text"
                    required
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="VD: 50.000đ hoặc 20%"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Loại *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="discount">Giảm giá</option>
                    <option value="cashback">Hoàn tiền</option>
                    <option value="gift">Quà tặng</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Xác suất (%) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="100"
                    value={formData.probability}
                    onChange={(e) => setFormData({ ...formData, probability: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày bắt đầu</label>
                  <input
                    type="date"
                    value={formData.validFrom}
                    onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày kết thúc</label>
                  <input
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button type="submit" className="flex-1 btn btn-primary">
                  {editingTemplate ? 'Cập Nhật' : 'Tạo Voucher'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    resetForm()
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
