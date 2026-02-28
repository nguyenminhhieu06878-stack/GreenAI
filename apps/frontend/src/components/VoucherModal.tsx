import { useEffect, useState } from 'react';
import { X, Copy, Check, Gift, Sparkles } from 'lucide-react';
import clsx from 'clsx';

interface VoucherModalProps {
  isOpen: boolean;
  onClose: () => void;
  voucherCode: string;
  voucherValue: string;
  isSpecialReward?: boolean;
}

export default function VoucherModal({
  isOpen,
  onClose,
  voucherCode,
  voucherValue,
  isSpecialReward = false,
}: VoucherModalProps) {
  const [copied, setCopied] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen && isSpecialReward) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, isSpecialReward]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(voucherCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Confetti effect */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="absolute animate-fall"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            >
              <div
                className={clsx(
                  'w-3 h-3 rounded-sm',
                  i % 4 === 0 && 'bg-green-500',
                  i % 4 === 1 && 'bg-blue-500',
                  i % 4 === 2 && 'bg-yellow-500',
                  i % 4 === 3 && 'bg-red-500'
                )}
              />
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white border border-gray-200 p-6 shadow-2xl animate-in zoom-in-95 duration-300">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        <div className="text-center">
          {/* Icon */}
          <div className={clsx(
            'mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-4',
            isSpecialReward ? 'bg-yellow-100' : 'bg-green-100'
          )}>
            {isSpecialReward ? (
              <Sparkles className="w-10 h-10 text-yellow-600" />
            ) : (
              <Gift className="w-10 h-10 text-green-600" />
            )}
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {isSpecialReward ? 'Phần Thưởng Đặc Biệt!' : 'Điểm Danh Thành Công!'}
          </h2>
          <p className="text-gray-600 mb-6">
            {isSpecialReward
              ? 'Cây của bạn đã trưởng thành! Đây là voucher độc quyền của bạn.'
              : 'Bạn đã nhận phần thưởng hàng ngày.'}
          </p>

          {/* Voucher Card */}
          <div className="relative bg-gradient-to-r from-green-600 to-green-500 rounded-xl p-6 mb-6 overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full" />
            <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full" />
            
            <div className="text-white">
              <p className="text-sm opacity-80 mb-1">Giá Trị Voucher</p>
              <p className="text-3xl font-bold mb-4">{voucherValue}</p>
              
              <div className="border-t border-white/20 pt-4">
                <p className="text-xs opacity-70 mb-1">Mã Voucher</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="font-mono text-lg tracking-wider">{voucherCode}</span>
                  <button
                    onClick={handleCopy}
                    className="p-1.5 rounded-md bg-white/20 hover:bg-white/30 transition-colors"
                  >
                    {copied ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Expiry */}
          <p className="text-sm text-gray-600 mb-6">
            Có hiệu lực trong 30 ngày kể từ hôm nay
          </p>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Để Sau
            </button>
            <button
              onClick={handleCopy}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              {copied ? 'Đã Sao Chép!' : 'Sao Chép Mã'}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fall {
          0% {
            transform: translateY(-100px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-fall {
          animation: fall linear forwards;
        }
      `}</style>
    </div>
  );
}
