import { useState, useEffect, lazy, Suspense } from 'react';
import { Calendar, Gift, Sparkles, TreeDeciduous, Award, Droplets } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';
import CalendarTracker from '../components/CalendarTracker';
import VoucherModal from '../components/VoucherModal';

const GrowingTree3D = lazy(() => import('../components/GrowingTree3D'));

const TARGET_DAYS = 25;
const TOTAL_DAYS = 25;

export default function CheckIn() {
  const [checkInData, setCheckInData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [showWatering, setShowWatering] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<any>(null);

  useEffect(() => {
    fetchCheckInStatus();
  }, []);

  const fetchCheckInStatus = async () => {
    try {
      const response = await api.get('/checkin/status');
      setCheckInData(response.data);
    } catch (error: any) {
      toast.error('Không thể tải trạng thái điểm danh');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    setChecking(true);
    setShowWatering(true);

    // Show watering animation for 2 seconds
    setTimeout(async () => {
      try {
        const response = await api.post('/checkin/check-in');
        toast.success(response.data.message);
        
        if (response.data.voucherCreated && response.data.voucher) {
          // Show voucher modal with the new voucher
          const newVoucher = response.data.voucher;
          setSelectedVoucher({
            ...newVoucher,
            // Ensure discount is set from value if not present
            discount: newVoucher.discount || parseInt(newVoucher.value) || 0
          });
          setShowModal(true);
        }
        
        await fetchCheckInStatus();
      } catch (error: any) {
        toast.error(error.response?.data?.error || 'Không thể điểm danh');
      } finally {
        setChecking(false);
        setShowWatering(false);
      }
    }, 2000);
  };

  const handleClaimVoucher = (voucher: any) => {
    setSelectedVoucher(voucher);
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Đang tải...</div>
      </div>
    );
  }

  const streak = checkInData?.streak || 0;
  const totalCheckIns = checkInData?.totalCheckIns || 0;
  const canCheckIn = checkInData?.canCheckIn;
  const vouchers = checkInData?.vouchers || [];
  const checkInHistory = checkInData?.checkInHistory || [];

  // Calculate checked days for calendar based on current streak
  // If streak is 2, it means days 1 and 2 are checked
  const checkedDays = Array.from({ length: streak }, (_, i) => i + 1);

  const currentDay = Math.min(streak + 1, TOTAL_DAYS);
  const hasVoucher = streak >= TARGET_DAYS && vouchers.some((v: any) => !v.isUsed);

  // Get tree stage name
  const getTreeStage = (level: number) => {
    if (level === 0) return 'Hạt Giống';
    if (level < 5) return 'Mầm Non';
    if (level < 10) return 'Cây Con';
    if (level < 15) return 'Cây Nhỏ';
    if (level < 20) return 'Cây Lớn';
    if (level < 25) return 'Cây Đang Nở Hoa';
    return 'Cây Trưởng Thành';
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="min-w-0">
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 truncate">Vườn Cây Tiết Kiệm Năng Lượng</h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Điểm danh mỗi ngày để cây phát triển
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm bg-blue-50 px-2.5 sm:px-3 py-1.5 rounded-full">
            <Droplets className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500 flex-shrink-0" />
            <span className="text-gray-700 font-medium whitespace-nowrap">Ngày {currentDay}/25</span>
          </div>
          {hasVoucher && (
            <button
              onClick={() => handleClaimVoucher(vouchers.find((v: any) => !v.isUsed))}
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-yellow-500 text-white rounded-full text-xs sm:text-sm font-semibold hover:bg-yellow-600 transition-colors animate-pulse whitespace-nowrap"
            >
              <Gift className="w-3.5 h-3.5 sm:w-4 sm:h-4 inline mr-1" />
              Nhận Voucher
            </button>
          )}
        </div>
      </div>

      {/* Hero section */}
      <div className="text-center mb-4 sm:mb-6 px-2">
        <div className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full bg-green-100 px-3 sm:px-4 py-2 mb-3 sm:mb-4">
          <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600 flex-shrink-0" />
          <span className="text-xs sm:text-sm text-green-700 font-medium">
            {hasVoucher
              ? 'Cây đã trưởng thành! Nhận voucher'
              : canCheckIn && !checking
              ? 'Tưới cây để phát triển!'
              : checking
              ? 'Đang tưới cây...'
              : 'Đã tưới hôm nay! Quay lại ngày mai'}
          </span>
        </div>
        <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
          {getTreeStage(streak)}
        </h2>
        <p className="text-xs sm:text-sm md:text-base text-gray-600 max-w-md mx-auto px-4">
          {hasVoucher
            ? 'Cây đã trưởng thành! Nhận voucher giảm giá độc quyền.'
            : `Tưới cây ${TARGET_DAYS} lần để nhận voucher. Đã tưới ${streak} lần.`}
        </p>
      </div>

      {/* 3D Tree */}
      <div className="max-w-lg mx-auto mb-4 sm:mb-6 px-2">
        <Suspense
          fallback={
            <div className="h-[300px] sm:h-[400px] md:h-[450px] w-full flex items-center justify-center bg-gray-50 rounded-xl">
              <div className="text-gray-500 text-sm">Đang tải cây 3D...</div>
            </div>
          }
        >
          <GrowingTree3D
            growthLevel={streak}
            canCheckIn={canCheckIn && !checking}
            onCheckIn={handleCheckIn}
            showWatering={showWatering}
            hasVoucher={hasVoucher}
          />
        </Suspense>
        {canCheckIn && !checking && (
          <div className="text-center mt-4">
            <button
              onClick={handleCheckIn}
              className="px-6 sm:px-8 py-2.5 sm:py-3 bg-green-600 text-white rounded-full text-sm sm:text-base font-semibold hover:bg-green-700 transition-colors shadow-lg"
            >
              <Droplets className="w-4 h-4 sm:w-5 sm:h-5 inline mr-2" />
              Tưới Cây
            </button>
          </div>
        )}
        {checking && (
          <div className="text-center mt-4">
            <div className="inline-flex items-center gap-2 text-blue-500">
              <Droplets className="w-4 h-4 sm:w-5 sm:h-5 animate-bounce" />
              <span className="text-sm sm:text-base font-medium">Đang tưới...</span>
            </div>
          </div>
        )}
      </div>

      {/* Calendar Tracker */}
      <div className="mb-6 sm:mb-8">
        <CalendarTracker
          checkedDays={checkedDays}
          currentDay={currentDay}
          targetDay={TARGET_DAYS}
        />
      </div>

      {/* Info cards */}
      {vouchers.length > 0 && (
        <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 border border-gray-200">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
            <Gift className="text-purple-500 w-5 h-5 sm:w-6 sm:h-6" />
            Voucher Của Bạn
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {vouchers.map((voucher: any) => (
              <div
                key={voucher._id}
                className="relative bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg sm:rounded-xl p-4 sm:p-6 text-white overflow-hidden cursor-pointer hover:scale-105 transition-transform"
                onClick={() => handleClaimVoucher(voucher)}
              >
                <div className="absolute top-0 right-0 text-4xl sm:text-6xl opacity-20">
                  <Sparkles />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-2">
                    <Gift className="w-5 h-5 sm:w-6 sm:h-6" />
                    <span className="font-bold text-xl sm:text-2xl">{voucher.discount}% OFF</span>
                  </div>
                  <div className="text-xs sm:text-sm opacity-90 mb-2 sm:mb-3">
                    Mã: <span className="font-mono font-bold">{voucher.code}</span>
                  </div>
                  <div className="text-[10px] sm:text-xs opacity-75">
                    Hết hạn: {new Date(voucher.expiresAt).toLocaleDateString('vi-VN')}
                  </div>
                  {voucher.isUsed && (
                    <div className="mt-2 text-[10px] sm:text-xs bg-white bg-opacity-20 rounded px-2 py-1 inline-block">
                      Đã sử dụng
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="bg-blue-50 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-blue-200">
        <h3 className="text-sm sm:text-base font-semibold text-blue-900 mb-2 sm:mb-3 flex items-center gap-2">
          <TreeDeciduous className="text-blue-600 w-4 h-4 sm:w-5 sm:h-5" />
          Hướng Dẫn Nuôi Cây
        </h3>
        <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-blue-800">
          <li>• Tưới cây mỗi ngày để cây phát triển</li>
          <li>• Tưới đủ 25 lần để nhận voucher (không cần liên tục)</li>
          <li>• Voucher giảm từ 20% đến 100% ngẫu nhiên</li>
          <li>• Voucher có hiệu lực 30 ngày kể từ khi nhận</li>
          <li>• Sau khi nhận voucher, cây reset để bắt đầu mới</li>
          <li>• Click vào cây 3D hoặc nút "Tưới Cây" để điểm danh</li>
        </ul>
      </div>

      {/* Voucher Modal */}
      {selectedVoucher && (
        <VoucherModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          voucherCode={selectedVoucher.code}
          voucherValue={`${selectedVoucher.discount}% OFF`}
          isSpecialReward={streak >= TARGET_DAYS}
        />
      )}
    </div>
  );
}
