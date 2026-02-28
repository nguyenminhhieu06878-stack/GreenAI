import { useState, useEffect } from 'react';

interface GrowingTree3DProps {
  growthLevel: number;
  canCheckIn: boolean;
  onCheckIn: () => void;
  showWatering: boolean;
  hasVoucher: boolean;
}

export default function GrowingTree3D({
  growthLevel,
  canCheckIn,
  onCheckIn,
  showWatering,
  hasVoucher,
}: GrowingTree3DProps) {
  const [showParticles, setShowParticles] = useState(false);

  // Map growthLevel to tree images
  const getTreeImage = (level: number) => {
    if (level === 0) return '/1.png';        // Day 0
    if (level <= 2) return '/2.png';         // Day 1-2
    if (level <= 5) return '/3.png';         // Day 3-5
    if (level <= 8) return '/4.png';         // Day 6-8
    if (level <= 10) return '/5.png';        // Day 9-10
    if (level <= 12) return '/5.5.png';      // Day 11-12
    if (level <= 14) return '/6.png';        // Day 13-14
    if (level <= 17) return '/7.png';        // Day 15-17
    if (level <= 20) return '/8.png';        // Day 18-20
    if (level <= 23) return '/9.png';        // Day 21-23
    return '/10.png';                        // Day 24-25+
  };

  useEffect(() => {
    if (showWatering) {
      setShowParticles(true);
      const timer = setTimeout(() => setShowParticles(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [showWatering]);

  return (
    <div className="relative h-[450px] w-full rounded-xl overflow-hidden bg-gradient-to-b from-sky-300 via-sky-100 to-amber-50">
      {/* Voucher ready hint */}
      {hasVoucher && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
          <div className="whitespace-nowrap rounded-full bg-yellow-500 px-4 py-2 text-sm font-semibold text-white animate-pulse shadow-lg">
            🎁 Voucher Sẵn Sàng!
          </div>
        </div>
      )}

      {/* Click hint */}
      {canCheckIn && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-10">
          <div className="whitespace-nowrap rounded-full bg-green-600 px-4 py-2 text-sm font-semibold text-white animate-bounce shadow-lg">
            💧 Nhấn để tưới nước!
          </div>
        </div>
      )}

      {/* Water particles */}
      {showParticles && (
        <div className="absolute inset-0 pointer-events-none z-20">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-blue-400 rounded-full opacity-70"
              style={{
                left: `${20 + Math.random() * 60}%`,
                top: '-10px',
                animation: `fall ${1 + Math.random() * 0.5}s linear ${Math.random() * 0.5}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Sparkle particles for voucher */}
      {hasVoucher && (
        <div className="absolute inset-0 pointer-events-none z-20">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="absolute text-2xl"
              style={{
                left: `${10 + Math.random() * 80}%`,
                top: `${10 + Math.random() * 60}%`,
                animation: `float ${2 + Math.random()}s ease-in-out ${Math.random() * 2}s infinite`,
              }}
            >
              ✨
            </div>
          ))}
        </div>
      )}

      {/* Tree image - maintain original aspect ratio */}
      <div
        className={`relative h-full w-full flex items-center justify-center ${
          canCheckIn ? 'cursor-pointer hover:scale-105' : ''
        } transition-transform duration-300`}
        onClick={() => canCheckIn && onCheckIn()}
      >
        <img
          src={getTreeImage(growthLevel)}
          alt={`Tree level ${growthLevel}`}
          className="max-h-[85%] max-w-[85%] object-contain drop-shadow-2xl"
          style={{
            filter: hasVoucher ? 'drop-shadow(0 0 20px rgba(255, 215, 0, 0.6))' : 'none',
          }}
        />
      </div>

      {/* Growth level indicator */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
        <div className="text-sm font-semibold text-gray-700">
          Ngày {growthLevel}/25 {growthLevel >= 25 && '🎁'}
        </div>
      </div>

      <style>{`
        @keyframes fall {
          from {
            transform: translateY(0);
            opacity: 1;
          }
          to {
            transform: translateY(460px);
            opacity: 0;
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
            opacity: 0.8;
          }
          50% {
            transform: translateY(-20px);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
