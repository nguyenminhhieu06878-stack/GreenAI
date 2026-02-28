import { useEffect, useState } from 'react'
import { TrendingUp, AlertTriangle, Lightbulb, BarChart3, Loader2, Lock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useRoomStore } from '@/stores/roomStore'
import api from '@/lib/api'

export default function AIInsights() {
  const navigate = useNavigate()
  const { selectedRoom } = useRoomStore()
  const [analysis, setAnalysis] = useState<any>(null)
  const [anomalies, setAnomalies] = useState<any>(null)
  const [tips, setTips] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [aiAccessSource, setAiAccessSource] = useState<string | null>(null)
  const [canAccess, setCanAccess] = useState<boolean | null>(null)

  useEffect(() => {
    checkAccessAndFetchData()
  }, [selectedRoom?._id])

  const checkAccessAndFetchData = async () => {
    setLoading(true)
    try {
      // Check AI Insights access first
      const accessCheck = await api.get('/ai/check-insights-access')
      setCanAccess(accessCheck.data.allowed)
      
      if (!accessCheck.data.allowed) {
        setLoading(false)
        return
      }

      // Build params with roomId if available
      const params: any = {}
      if (selectedRoom?._id) {
        params.roomId = selectedRoom._id
      }

      // If allowed, fetch AI data
      const [analysisRes, anomaliesRes, tipsRes] = await Promise.all([
        api.get('/ai/analyze', { params }),
        api.get('/ai/anomalies', { params }),
        api.get('/ai/tips', { params })
      ])

      setAnalysis(analysisRes.data)
      setAnomalies(anomaliesRes.data)
      setTips(tipsRes.data)
      
      // Set AI access source from any response
      if (analysisRes.data.aiAccessSource) {
        setAiAccessSource(analysisRes.data.aiAccessSource)
      }
    } catch (error) {
      console.error('Failed to fetch AI data:', error)
      setCanAccess(false)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2].map(i => (
          <div key={i} className="card">
            <div className="flex items-center justify-center h-32">
              <Loader2 className="animate-spin text-green-500" size={32} />
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Show upgrade message if no access
  if (canAccess === false) {
    return (
      <div className="card bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200">
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
            <Lock className="text-purple-600" size={32} />
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            🤖 AI Phân Tích & Phát Hiện Bất Thường
          </h3>
          
          <p className="text-gray-700 mb-4 max-w-md mx-auto text-sm">
            Tính năng AI phân tích tiêu thụ và phát hiện bất thường chỉ khả dụng từ <span className="font-semibold text-purple-600">Gói Professional (199k)</span> trở lên.
          </p>

          <button
            onClick={() => navigate('/bang-gia')}
            className="btn btn-primary"
          >
            Nâng Cấp Ngay
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* AI Access Source Info */}
      {aiAccessSource === 'landlord' && (
        <div className="card bg-blue-50 border-blue-200">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Lightbulb className="text-blue-600" size={20} />
            </div>
            <p className="text-sm text-blue-800">
              💡 Bạn đang sử dụng tính năng AI thông qua gói của chủ trọ
            </p>
          </div>
        </div>
      )}

      {/* Anomalies Alert */}
      {anomalies?.hasAnomaly && anomalies.anomalies.length > 0 && (
        <div className="card bg-red-50 border-red-200">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="text-red-600" size={24} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-red-900 mb-2">⚠️ Phát Hiện Bất Thường</h3>
              <div className="space-y-2">
                {anomalies.anomalies.map((anomaly: any, index: number) => (
                  <div key={index} className="bg-white rounded-lg p-3 border border-red-200">
                    <p className="text-sm text-red-800 font-medium">{anomaly.message}</p>
                    <p className="text-xs text-red-600 mt-1">
                      {new Date(anomaly.date).toLocaleDateString('vi-VN')} - 
                      Tiêu thụ: {anomaly.consumption.toFixed(1)} kWh - 
                      Chi phí: {anomaly.cost.toLocaleString('vi-VN')}đ
                    </p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-red-700 mt-2">
                Trung bình: {anomalies.avgConsumption} kWh
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Analysis Insights */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart3 className="text-blue-600" size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Phân Tích Tiêu Thụ</h3>
              <p className="text-xs text-gray-600">
                Dựa trên {analysis?.totalReadings || 0} lần nhập
              </p>
            </div>
          </div>

          {analysis?.insights && analysis.insights.length > 0 ? (
            <div className="space-y-2">
              {analysis.insights.map((insight: string, index: number) => (
                <div key={index} className="flex items-start gap-2 bg-blue-50 rounded-lg p-3">
                  <TrendingUp size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-700">{insight}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">Cần thêm dữ liệu để phân tích</p>
          )}

          {analysis?.recommendations && analysis.recommendations.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs font-semibold text-gray-700 mb-2">Khuyến nghị:</p>
              <div className="space-y-1">
                {analysis.recommendations.slice(0, 2).map((rec: string, index: number) => (
                  <p key={index} className="text-xs text-gray-600">• {rec}</p>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Savings Tips */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <Lightbulb className="text-green-600" size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Mẹo Tiết Kiệm Điện</h3>
              <p className="text-xs text-gray-600">AI đề xuất cho bạn</p>
            </div>
          </div>

          {tips?.tips && tips.tips.length > 0 ? (
            <div className="space-y-2">
              {tips.tips.map((tip: string, index: number) => (
                <div key={index} className="flex items-start gap-2 bg-green-50 rounded-lg p-3">
                  <span className="text-green-600 font-semibold flex-shrink-0">{index + 1}.</span>
                  <p className="text-sm text-gray-700">{tip}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">Đang tải mẹo tiết kiệm...</p>
          )}
        </div>
      </div>
    </div>
  )
}
