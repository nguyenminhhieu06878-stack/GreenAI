import { useState, useRef, useEffect } from 'react'
import { Camera, Upload, Save, X, Trash2 } from 'lucide-react'
import { useMeterReading } from '@/hooks/useMeterReading'
import { useSearchParams } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import api from '@/lib/api'
import toast from 'react-hot-toast'

export default function MeterReading() {
  const [searchParams] = useSearchParams()
  const roomId = searchParams.get('roomId')
  const { user } = useAuthStore()
  const [reading, setReading] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [image, setImage] = useState<File | null>(null)
  const [showCamera, setShowCamera] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const { uploadImage, addManualReading, readings, isLoading, isUploading, isAdding } = useMeterReading()

  useEffect(() => {
    // Show room info if roomId is present
    if (roomId) {
      console.log('Recording for room:', roomId)
    }
  }, [roomId])

  const handleDeleteReading = async (readingId: string) => {
    if (!confirm('Bạn có chắc muốn xóa chỉ số này?')) return

    try {
      await api.delete(`/meter/readings/${readingId}`)
      toast.success('Đã xóa chỉ số')
      window.location.reload()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Không thể xóa chỉ số')
    }
  }

  const canDelete = (reading: any) => {
    // Landlord can delete any reading
    if (user?.role === 'landlord') return true
    
    // Tenant can only delete their own readings
    // Cannot delete landlord's readings
    const readingUserRole = reading.userId?.role
    const readingUserId = typeof reading.userId === 'object' ? reading.userId._id : reading.userId
    
    if (readingUserRole === 'landlord') return false
    return readingUserId === user?.id
  }

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Use back camera on mobile
      })
      setStream(mediaStream)
      setShowCamera(true)
      
      // Wait for video element to be available
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream
        }
      }, 100)
    } catch (error) {
      toast.error('Không thể truy cập camera. Vui lòng cho phép quyền truy cập camera.')
      console.error('Camera error:', error)
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    setShowCamera(false)
  }

  const capturePhoto = () => {
    if (!videoRef.current) return

    const video = videoRef.current
    const canvas = document.createElement('canvas')
    
    // Get video dimensions
    const videoWidth = video.videoWidth
    const videoHeight = video.videoHeight
    
    // Calculate crop area (76% width, 70px height, centered)
    const cropWidth = videoWidth * 0.76
    const cropHeight = Math.min(70 * (videoWidth / 400), videoHeight * 0.15) // Scale based on video size
    const cropX = (videoWidth - cropWidth) / 2
    const cropY = (videoHeight - cropHeight) / 2
    
    // Set canvas to crop size
    canvas.width = cropWidth
    canvas.height = cropHeight
    
    const ctx = canvas.getContext('2d')
    
    if (ctx) {
      // Draw only the cropped region
      ctx.drawImage(
        video,
        cropX, cropY, cropWidth, cropHeight, // Source rectangle (crop area)
        0, 0, cropWidth, cropHeight           // Destination rectangle (full canvas)
      )
      
      // Enhance brightness and contrast
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageData.data
      
      // Increase brightness by 20% and contrast
      const brightness = 1.2
      const contrast = 1.1
      
      for (let i = 0; i < data.length; i += 4) {
        // Apply brightness and contrast to RGB channels
        data[i] = Math.min(255, ((data[i] - 128) * contrast + 128) * brightness)     // Red
        data[i + 1] = Math.min(255, ((data[i + 1] - 128) * contrast + 128) * brightness) // Green
        data[i + 2] = Math.min(255, ((data[i + 2] - 128) * contrast + 128) * brightness) // Blue
      }
      
      ctx.putImageData(imageData, 0, 0)
      
      // Convert to blob with good quality
      canvas.toBlob((blob) => {
        if (blob) {
          console.log('📸 Captured cropped image size:', blob.size, 'bytes')
          console.log('📐 Cropped dimensions:', canvas.width, 'x', canvas.height)
          console.log('✂️ Crop area: x=' + cropX + ', y=' + cropY + ', w=' + cropWidth + ', h=' + cropHeight)
          
          const file = new File([blob], 'camera-photo.jpg', { type: 'image/jpeg' })
          setImage(file)
          stopCamera()
        }
      }, 'image/jpeg', 0.95) // Higher quality
    }
  }

  const handleImageUpload = async () => {
    if (!image) return
    
    const loadingToast = toast.loading('Đang nhận diện chỉ số điện...')
    
    try {
      const result = await uploadImage(image)
      toast.dismiss(loadingToast)
      
      if (result) {
        // Show result and allow user to edit
        const userInput = prompt(
          `Nhận diện thành công!\nChỉ số: ${result.reading} kWh\nĐộ tin cậy: ${(result.confidence * 100).toFixed(0)}%\n\nNếu chỉ số sai, vui lòng nhập chỉ số đúng (hoặc nhấn Cancel để giữ nguyên):`,
          result.reading.toString()
        )
        
        if (userInput !== null && userInput !== result.reading.toString()) {
          // User edited the value, update it
          const correctedValue = parseFloat(userInput)
          if (!isNaN(correctedValue) && correctedValue > 0) {
            try {
              await api.put(`/meter/readings/${result.id}`, { value: correctedValue })
              toast.success('Đã cập nhật chỉ số thành công!')
            } catch (error) {
              toast.error('Không thể cập nhật chỉ số')
            }
          }
        } else {
          toast.success('Đã lưu chỉ số điện thành công!')
        }
        
        setImage(null)
      }
    } catch (error: any) {
      toast.dismiss(loadingToast)
      toast.error(error.response?.data?.error || 'Không thể nhận diện ảnh')
    }
  }

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const loadingToast = toast.loading('Đang lưu chỉ số...')
    
    try {
      await addManualReading(parseFloat(reading), date)
      toast.dismiss(loadingToast)
      toast.success('Đã lưu chỉ số điện: ' + reading + ' kWh')
      setReading('')
    } catch (error: any) {
      toast.dismiss(loadingToast)
      toast.error(error.response?.data?.error || 'Không thể lưu chỉ số')
    }
  }

  const isProcessing = isUploading || isAdding

  return (
    <div className="space-y-4 sm:space-y-6">
      <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Nhập Chỉ Số Điện</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 border border-gray-200 shadow-sm">
          <h2 className="text-sm sm:text-base lg:text-lg font-semibold mb-3 sm:mb-4">Chụp Ảnh Đồng Hồ Điện</h2>
          
          {showCamera ? (
            <div className="space-y-4">
              <div className="relative bg-black rounded-lg overflow-hidden">
                <video 
                  ref={videoRef}
                  autoPlay 
                  playsInline
                  className="w-full rounded-lg relative z-0"
                />
                
                {/* Camera Guide Overlay */}
                <div className="absolute inset-0 pointer-events-none z-10">
                  {/* Dark overlay with transparent center */}
                  <div className="absolute inset-0 bg-black bg-opacity-40"></div>
                  
                  {/* Guide box for meter reading */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[76%] max-w-lg">
                    {/* Transparent cutout */}
                    <div className="absolute inset-0 rounded-xl" style={{ 
                      height: '70px',
                      boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.4)'
                    }}></div>
                    
                    {/* Animated scanning line */}
                    <div className="absolute inset-0 overflow-hidden rounded-xl" style={{ height: '70px' }}>
                      <div className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-pulse" 
                           style={{ 
                             top: '50%',
                             animation: 'scan 2s ease-in-out infinite'
                           }}>
                      </div>
                    </div>
                    
                    {/* Main border box */}
                    <div className="relative rounded-xl overflow-hidden" style={{ height: '70px' }}>
                      {/* Glowing border effect */}
                      <div className="absolute inset-0 border-4 border-emerald-400 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.5)] animate-pulse"></div>
                      
                      {/* Corner brackets - top left */}
                      <div className="absolute top-0 left-0 w-8 h-8">
                        <div className="absolute top-0 left-0 w-full h-1 bg-white shadow-lg"></div>
                        <div className="absolute top-0 left-0 w-1 h-full bg-white shadow-lg"></div>
                      </div>
                      
                      {/* Corner brackets - top right */}
                      <div className="absolute top-0 right-0 w-8 h-8">
                        <div className="absolute top-0 right-0 w-full h-1 bg-white shadow-lg"></div>
                        <div className="absolute top-0 right-0 w-1 h-full bg-white shadow-lg"></div>
                      </div>
                      
                      {/* Corner brackets - bottom left */}
                      <div className="absolute bottom-0 left-0 w-8 h-8">
                        <div className="absolute bottom-0 left-0 w-full h-1 bg-white shadow-lg"></div>
                        <div className="absolute bottom-0 left-0 w-1 h-full bg-white shadow-lg"></div>
                      </div>
                      
                      {/* Corner brackets - bottom right */}
                      <div className="absolute bottom-0 right-0 w-8 h-8">
                        <div className="absolute bottom-0 right-0 w-full h-1 bg-white shadow-lg"></div>
                        <div className="absolute bottom-0 right-0 w-1 h-full bg-white shadow-lg"></div>
                      </div>
                      
                      {/* Center target */}
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <div className="relative w-6 h-6">
                          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-emerald-400 transform -translate-y-1/2"></div>
                          <div className="absolute top-0 left-1/2 w-0.5 h-full bg-emerald-400 transform -translate-x-1/2"></div>
                          <div className="absolute top-1/2 left-1/2 w-2 h-2 border-2 border-emerald-400 rounded-full transform -translate-x-1/2 -translate-y-1/2 bg-emerald-400 bg-opacity-30"></div>
                        </div>
                      </div>
                      
                      {/* Helper lines */}
                      <div className="absolute top-1/2 left-0 w-3 h-0.5 bg-emerald-400 transform -translate-y-1/2"></div>
                      <div className="absolute top-1/2 right-0 w-3 h-0.5 bg-emerald-400 transform -translate-y-1/2"></div>
                    </div>
                  </div>
                </div>
                
                <style>{`
                  @keyframes scan {
                    0%, 100% { top: 0%; }
                    50% { top: 100%; }
                  }
                `}</style>
              </div>
              
              {/* Buttons outside video */}
              <div className="flex gap-2">
                <button 
                  onClick={capturePhoto}
                  className="flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                >
                  <Camera size={18} />
                  <span>Chụp ảnh</span>
                </button>
                <button 
                  onClick={stopCamera}
                  className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 sm:p-8 text-center">
              {image ? (
                <div>
                  <img src={URL.createObjectURL(image)} alt="Preview" className="max-h-48 sm:max-h-64 mx-auto rounded-lg" />
                  <button 
                    onClick={() => setImage(null)}
                    className="mt-3 sm:mt-4 text-xs sm:text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    Xóa ảnh
                  </button>
                </div>
              ) : (
                <div>
                  <Camera size={40} className="mx-auto text-gray-400 mb-3 sm:mb-4 sm:w-12 sm:h-12" />
                  <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">Chụp hoặc tải lên ảnh đồng hồ điện</p>
                  <div className="flex flex-col sm:flex-row gap-2 justify-center">
                    <button 
                      onClick={startCamera}
                      className="w-full sm:w-auto px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-xs sm:text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <Camera size={18} />
                      <span>Mở camera</span>
                    </button>
                    <label className="w-full sm:w-auto px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-xs sm:text-sm font-medium cursor-pointer flex items-center justify-center gap-2">
                      <Upload size={18} />
                      <span>Chọn ảnh</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden"
                        onChange={(e) => e.target.files && setImage(e.target.files[0])}
                      />
                    </label>
                  </div>
                </div>
              )}
            </div>
          )}

          {image && !showCamera && (
            <button 
              onClick={handleImageUpload}
              disabled={isProcessing}
              className="w-full px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors mt-4 text-xs sm:text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? 'Đang nhận diện...' : 'Nhận diện chỉ số tự động'}
            </button>
          )}
        </div>

        <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 border border-gray-200 shadow-sm">
          <h2 className="text-sm sm:text-base lg:text-lg font-semibold mb-3 sm:mb-4">Nhập Thủ Công</h2>
          
          <form onSubmit={handleManualSubmit} className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                Chỉ số điện (kWh)
              </label>
              <input
                type="number"
                step="0.1"
                value={reading}
                onChange={(e) => setReading(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                placeholder="Nhập chỉ số điện"
                required
                disabled={isProcessing}
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                Ngày ghi nhận
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
              />
            </div>

            <button 
              type="submit" 
              className="w-full px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-xs sm:text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2" 
              disabled={isProcessing}
            >
              <Save size={18} />
              <span>{isAdding ? 'Đang lưu...' : 'Lưu chỉ số'}</span>
            </button>
          </form>
        </div>
      </div>

      <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 border border-gray-200 shadow-sm">
        <h2 className="text-sm sm:text-base lg:text-lg font-semibold mb-3 sm:mb-4">Lịch Sử Chỉ Số</h2>
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          {isLoading ? (
            <div className="text-center py-8 text-gray-600 text-sm">Đang tải...</div>
          ) : readings && readings.length > 0 ? (
            <div className="min-w-[640px] px-4 sm:px-0">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 sm:px-4 py-2.5 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-700">Ngày</th>
                    <th className="px-3 sm:px-4 py-2.5 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-700">Chỉ số (kWh)</th>
                    <th className="px-3 sm:px-4 py-2.5 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-700">Tiêu thụ</th>
                    <th className="px-3 sm:px-4 py-2.5 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-700">Phương thức</th>
                    <th className="px-3 sm:px-4 py-2.5 sm:py-3 text-center text-xs sm:text-sm font-medium text-gray-700">Hình ảnh</th>
                    <th className="px-3 sm:px-4 py-2.5 sm:py-3 text-center text-xs sm:text-sm font-medium text-gray-700">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {readings.map((r: any) => (
                    <tr key={r._id} className="hover:bg-gray-50">
                      <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm whitespace-nowrap">
                        {new Date(r.createdAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-medium">
                        {r.value ? r.value.toFixed(1) : r.reading?.toFixed(1) || '-'}
                      </td>
                      <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm">
                        {r.consumption > 0 ? `${r.consumption.toFixed(1)} kWh` : '-'}
                      </td>
                      <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                          r.method === 'auto' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {r.method === 'auto' ? 'Tự động' : 'Thủ công'}
                        </span>
                      </td>
                      <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-center text-xs sm:text-sm">
                        {r.imagePath ? (
                          <button
                            onClick={() => window.open(`${import.meta.env.VITE_API_URL}/${r.imagePath}`, '_blank')}
                            className="text-emerald-600 hover:text-emerald-700 font-medium whitespace-nowrap"
                          >
                            Xem ảnh
                          </button>
                        ) : (
                          <span className="text-gray-400">Không có</span>
                        )}
                      </td>
                      <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-center text-xs sm:text-sm">
                        {canDelete(r) ? (
                          <button
                            onClick={() => handleDeleteReading(r._id)}
                            className="text-red-600 hover:text-red-700 p-1.5 sm:p-2 hover:bg-red-50 rounded-lg transition-colors inline-flex items-center justify-center"
                            title="Xóa"
                          >
                            <Trash2 size={14} className="sm:w-4 sm:h-4" />
                          </button>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 text-xs sm:text-sm">
              Chưa có dữ liệu. Hãy nhập chỉ số điện đầu tiên!
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
