import { useState } from 'react';
import { Users, Home } from 'lucide-react';
import toast from 'react-hot-toast';

interface RoleSelectionModalProps {
  token: string;
  onComplete: (role: 'tenant' | 'landlord') => void;
}

export default function RoleSelectionModal({ token, onComplete }: RoleSelectionModalProps) {
  const [selectedRole, setSelectedRole] = useState<'tenant' | 'landlord' | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!selectedRole) {
      toast.error('Vui lòng chọn vai trò');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/auth/role', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: selectedRole })
      });

      if (response.ok) {
        toast.success('Đã cập nhật vai trò thành công!');
        onComplete(selectedRole);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Cập nhật vai trò thất bại');
      }
    } catch (error: any) {
      toast.error('Cập nhật vai trò thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 animate-in fade-in zoom-in duration-300">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Chào mừng bạn đến với GreenEnergyAI! 🎉
          </h2>
          <p className="text-gray-600">
            Vui lòng chọn vai trò của bạn để tiếp tục
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Tenant Option */}
          <button
            onClick={() => setSelectedRole('tenant')}
            className={`relative p-6 rounded-xl border-2 transition-all duration-200 text-left ${
              selectedRole === 'tenant'
                ? 'border-emerald-500 bg-emerald-50 shadow-lg scale-105'
                : 'border-gray-200 hover:border-emerald-300 hover:shadow-md'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-lg ${
                selectedRole === 'tenant' ? 'bg-emerald-500' : 'bg-gray-100'
              }`}>
                <Users className={`w-6 h-6 ${
                  selectedRole === 'tenant' ? 'text-white' : 'text-gray-600'
                }`} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-gray-900 mb-2">
                  Người Thuê Trọ
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  Theo dõi tiêu thụ điện, nhận thông báo hóa đơn và quản lý chi phí
                </p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>✓ Theo dõi tiêu thụ điện</li>
                  <li>✓ Nhận thông báo hóa đơn</li>
                  <li>✓ AI tư vấn tiết kiệm</li>
                </ul>
              </div>
            </div>
            {selectedRole === 'tenant' && (
              <div className="absolute top-3 right-3">
                <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            )}
          </button>

          {/* Landlord Option */}
          <button
            onClick={() => setSelectedRole('landlord')}
            className={`relative p-6 rounded-xl border-2 transition-all duration-200 text-left ${
              selectedRole === 'landlord'
                ? 'border-emerald-500 bg-emerald-50 shadow-lg scale-105'
                : 'border-gray-200 hover:border-emerald-300 hover:shadow-md'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-lg ${
                selectedRole === 'landlord' ? 'bg-emerald-500' : 'bg-gray-100'
              }`}>
                <Home className={`w-6 h-6 ${
                  selectedRole === 'landlord' ? 'text-white' : 'text-gray-600'
                }`} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-gray-900 mb-2">
                  Chủ Trọ
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  Quản lý phòng trọ, theo dõi người thuê và tạo hóa đơn tự động
                </p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>✓ Quản lý nhiều phòng trọ</li>
                  <li>✓ Tạo hóa đơn tự động</li>
                  <li>✓ Theo dõi thanh toán</li>
                </ul>
              </div>
            </div>
            {selectedRole === 'landlord' && (
              <div className="absolute top-3 right-3">
                <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            )}
          </button>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!selectedRole || loading}
          className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold py-4 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        >
          {loading ? 'Đang xử lý...' : 'Tiếp tục →'}
        </button>

        <p className="text-center text-xs text-gray-500 mt-4">
          Bạn có thể thay đổi vai trò sau trong phần Cài đặt
        </p>
      </div>
    </div>
  );
}
