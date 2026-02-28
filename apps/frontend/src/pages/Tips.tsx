import { useState } from 'react'
import { Lightbulb, Wind, Tv, Refrigerator, X, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

interface Tip {
  icon: any
  title: string
  description: string
  savings: string
  color: string
  detailedSteps: string[]
}

const tips: Tip[] = [
  {
    icon: Wind,
    title: 'Tắt Điều Hòa Khi Không Sử Dụng',
    description: 'Điều hòa tiêu thụ 30-40% tổng điện năng. Tắt khi ra ngoài để tiết kiệm đáng kể.',
    savings: '30%',
    color: 'orange',
    detailedSteps: [
      'Tắt điều hòa khi rời khỏi phòng trên 30 phút',
      'Đặt nhiệt độ ở mức 25-26°C để tiết kiệm điện',
      'Sử dụng chế độ hẹn giờ tắt khi ngủ',
      'Vệ sinh lọc điều hòa định kỳ mỗi tháng',
      'Đóng cửa phòng kín để giữ nhiệt độ ổn định'
    ]
  },
  {
    icon: Lightbulb,
    title: 'Sử Dụng Đèn LED',
    description: 'Đèn LED tiêu thụ ít điện hơn 80% so với đèn sợi đốt và tuổi thọ cao hơn.',
    savings: '80%',
    color: 'yellow',
    detailedSteps: [
      'Thay thế tất cả đèn sợi đốt bằng đèn LED',
      'Chọn đèn LED có công suất phù hợp với không gian',
      'Tắt đèn khi ra khỏi phòng',
      'Sử dụng đèn cảm biến chuyển động ở hành lang',
      'Tận dụng ánh sáng tự nhiên ban ngày'
    ]
  },
  {
    icon: Tv,
    title: 'Rút Phích Cắm Thiết Bị Điện',
    description: 'Các thiết bị ở chế độ chờ vẫn tiêu thụ điện. Rút phích khi không dùng.',
    savings: '10%',
    color: 'blue',
    detailedSteps: [
      'Rút phích cắm TV, máy tính khi không sử dụng',
      'Sử dụng ổ cắm có công tắc để dễ tắt nguồn',
      'Tắt nguồn sạc điện thoại sau khi sạc xong',
      'Ngắt nguồn máy giặt, lò vi sóng khi không dùng',
      'Kiểm tra và rút các thiết bị không cần thiết'
    ]
  },
  {
    icon: Refrigerator,
    title: 'Giữ Cánh Tủ Lạnh Kín',
    description: 'Mở tủ lạnh thường xuyên làm tăng tiêu thụ điện. Lấy đồ nhanh và đóng kín.',
    savings: '15%',
    color: 'green',
    detailedSteps: [
      'Mở tủ lạnh nhanh và đóng kín ngay',
      'Kiểm tra gioăng cửa tủ lạnh định kỳ',
      'Không để tủ lạnh quá đầy hoặc quá trống',
      'Để thức ăn nguội trước khi cho vào tủ lạnh',
      'Vệ sinh tủ lạnh và rã đông định kỳ'
    ]
  }
]

export default function Tips() {
  const [selectedTip, setSelectedTip] = useState<Tip | null>(null)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())

  const handleImplement = (tip: Tip) => {
    setSelectedTip(tip)
    setCompletedSteps(new Set())
  }

  const toggleStep = (index: number) => {
    const newCompleted = new Set(completedSteps)
    if (newCompleted.has(index)) {
      newCompleted.delete(index)
    } else {
      newCompleted.add(index)
    }
    setCompletedSteps(newCompleted)
  }

  const handleComplete = () => {
    if (completedSteps.size === selectedTip?.detailedSteps.length) {
      toast.success('Tuyệt vời! Bạn đã hoàn thành tất cả các bước!')
      setSelectedTip(null)
    } else {
      toast.error('Vui lòng hoàn thành tất cả các bước')
    }
  }
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-6 border border-yellow-200">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Khám phá các mẹo giúp tiết kiệm điện năng hiệu quả!
        </h1>
        <p className="text-gray-600">
          Ngăn chặn lãng phí - Tiền bạc tiết kiệm - Hành vi thân thiện với môi trường
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tips.map((tip, index) => {
          const Icon = tip.icon
          const colorClasses = {
            orange: 'bg-orange-100 text-orange-600',
            yellow: 'bg-yellow-100 text-yellow-600',
            blue: 'bg-blue-100 text-blue-600',
            green: 'bg-green-100 text-green-600'
          }
          
          return (
            <div key={index} className="card hover:shadow-lg transition-shadow flex flex-col">
              <div className="flex items-start space-x-4 flex-1">
                <div className={`p-3 rounded-full ${colorClasses[tip.color as keyof typeof colorClasses]} flex-shrink-0`}>
                  <Icon size={24} />
                </div>
                <div className="flex-1 flex flex-col">
                  <h3 className="font-semibold text-lg mb-2">{tip.title}</h3>
                  <p className="text-gray-600 text-sm mb-3 flex-1">{tip.description}</p>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-gray-500">Tiết kiệm lên đến</span>
                    <span className="text-2xl font-bold text-primary-600">{tip.savings}</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => handleImplement(tip)}
                className="w-full btn btn-primary text-sm mt-4"
              >
                Thực hiện ngay
              </button>
            </div>
          )
        })}
      </div>

      {/* Modal */}
      {selectedTip && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-full ${
                  selectedTip.color === 'orange' ? 'bg-orange-100 text-orange-600' :
                  selectedTip.color === 'yellow' ? 'bg-yellow-100 text-yellow-600' :
                  selectedTip.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                  'bg-green-100 text-green-600'
                }`}>
                  <selectedTip.icon size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedTip.title}</h2>
                  <p className="text-sm text-gray-600">Tiết kiệm lên đến {selectedTip.savings}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTip(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={24} className="text-gray-600" />
              </button>
            </div>

            <div className="p-6">
              <p className="text-gray-700 mb-6">{selectedTip.description}</p>

              <h3 className="font-semibold text-lg mb-4">Các bước thực hiện:</h3>
              <div className="space-y-3">
                {selectedTip.detailedSteps.map((step, index) => (
                  <div
                    key={index}
                    onClick={() => toggleStep(index)}
                    className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      completedSteps.has(index)
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      completedSteps.has(index)
                        ? 'border-green-500 bg-green-500'
                        : 'border-gray-300'
                    }`}>
                      {completedSteps.has(index) && (
                        <CheckCircle size={20} className="text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm ${
                        completedSteps.has(index) ? 'text-green-900 font-medium' : 'text-gray-700'
                      }`}>
                        {step}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={handleComplete}
                  className="flex-1 btn btn-primary"
                >
                  Hoàn thành ({completedSteps.size}/{selectedTip.detailedSteps.length})
                </button>
                <button
                  onClick={() => setSelectedTip(null)}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
