import { AlertCircle } from 'lucide-react'

interface ErrorMessageProps {
  message: string
  onRetry?: () => void
}

export default function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div className="card bg-red-50 border-red-200">
      <div className="flex items-start space-x-3">
        <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
        <div className="flex-1">
          <p className="text-red-800 font-medium">Đã xảy ra lỗi</p>
          <p className="text-red-600 text-sm mt-1">{message}</p>
          {onRetry && (
            <button 
              onClick={onRetry}
              className="mt-3 text-sm text-red-700 hover:text-red-800 font-medium"
            >
              Thử lại
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
