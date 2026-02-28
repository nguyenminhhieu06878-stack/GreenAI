import { Check, Gift, Droplets } from 'lucide-react';
import clsx from 'clsx';

interface CalendarTrackerProps {
  checkedDays: number[];
  currentDay: number;
  targetDay: number;
}

export default function CalendarTracker({
  checkedDays,
  currentDay,
  targetDay,
}: CalendarTrackerProps) {
  const weeks = [];
  for (let i = 0; i < 25; i += 7) {
    weeks.push(Array.from({ length: Math.min(7, 25 - i) }, (_, j) => i + j + 1));
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Thử Thách 25 Ngày</h2>
          <p className="text-gray-600 text-sm">
            Tưới cây 25 ngày để nhận voucher
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-green-100 px-4 py-2">
          <Droplets className="w-5 h-5 text-green-600" />
          <span className="text-xl font-bold text-green-600">{checkedDays.length}</span>
          <span className="text-sm text-gray-600">/25</span>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="rounded-xl bg-white border border-gray-200 p-4 shadow-sm">
        <div className="space-y-1">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7 gap-1">
              {weekIndex === 0 &&
                Array.from({ length: 7 - week.length }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}
              {week.map((day) => {
                const isChecked = checkedDays.includes(day);
                const isToday = day === currentDay;
                const isVoucherDay = day === targetDay;

                return (
                  <div
                    key={day}
                    className={clsx(
                      'relative aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition-all',
                      isChecked && 'bg-green-600 text-white',
                      isToday && !isChecked && 'bg-blue-100 ring-2 ring-blue-500',
                      !isChecked && !isToday && 'bg-gray-100 text-gray-400',
                      isVoucherDay && 'ring-2 ring-yellow-500'
                    )}
                  >
                    {isChecked ? (
                      <Check className="w-4 h-4" />
                    ) : isVoucherDay ? (
                      <Gift className="w-4 h-4" />
                    ) : (
                      day
                    )}
                    {isVoucherDay && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full" />
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600">Tiến Độ Phát Triển</span>
          <span className="text-green-600 font-semibold">
            {Math.round((checkedDays.length / 25) * 100)}%
          </span>
        </div>
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden relative">
          <div
            className="h-full bg-gradient-to-r from-green-400 via-green-500 to-green-600 transition-all duration-500 rounded-full"
            style={{ width: `${Math.min((checkedDays.length / 25) * 100, 100)}%` }}
          />
          {/* Milestone markers */}
          <div className="absolute top-0 left-0 w-full h-full flex items-center">
            {[5, 10, 15, 20, 25].map((milestone) => (
              <div
                key={milestone}
                className="absolute w-0.5 h-full bg-white/50"
                style={{ left: `${(milestone / 25) * 100}%` }}
              />
            ))}
          </div>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Mầm</span>
          <span>Cây Con</span>
          <span>Cây</span>
          <span>Nở Hoa</span>
          <span>Voucher</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-4 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-green-600 flex items-center justify-center">
            <Check className="w-3 h-3 text-white" />
          </div>
          <span className="text-gray-600">Đã Tưới</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-blue-100 ring-2 ring-blue-500" />
          <span className="text-gray-600">Hôm Nay</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-gray-100" />
          <span className="text-gray-600">Chưa Tưới</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-gray-100 ring-2 ring-yellow-500 flex items-center justify-center">
            <Gift className="w-3 h-3 text-gray-400" />
          </div>
          <span className="text-gray-600">Ngày Voucher</span>
        </div>
      </div>
    </div>
  );
}
