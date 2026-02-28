import { useState, useEffect, useRef } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { MessageCircle, Send, Lock } from 'lucide-react'
import api from '@/lib/api'
import toast from 'react-hot-toast'

interface Message {
  _id: string
  userId: string
  message: string
  isAdminReply: boolean
  adminId?: {
    name: string
    email: string
  }
  createdAt: string
}

const POLLING_INTERVAL = 3000 // Poll every 3 seconds

export default function Support() {
  const { user } = useAuthStore()
  const [hasAccess, setHasAccess] = useState(false)
  const [loading, setLoading] = useState(true)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastMessageTimeRef = useRef<string>(new Date(0).toISOString())

  useEffect(() => {
    checkAccess()
  }, [])

  useEffect(() => {
    if (hasAccess && user) {
      loadMessages()
      startPolling()
    }

    return () => {
      stopPolling()
    }
  }, [hasAccess, user])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const checkAccess = async () => {
    try {
      const response = await api.get('/support/check-access')
      setHasAccess(response.data.hasAccess)
    } catch (error) {
      console.error('Error checking support access:', error)
      setHasAccess(false)
    } finally {
      setLoading(false)
    }
  }

  const loadMessages = async () => {
    try {
      const response = await api.get('/support/messages')
      setMessages(response.data)
      
      // Update last message time
      if (response.data.length > 0) {
        const lastMsg = response.data[response.data.length - 1]
        lastMessageTimeRef.current = lastMsg.createdAt
      }
    } catch (error) {
      console.error('Error loading messages:', error)
      toast.error('Không thể tải tin nhắn')
    }
  }

  const pollNewMessages = async () => {
    try {
      const response = await api.get('/support/messages/new', {
        params: { since: lastMessageTimeRef.current }
      })
      
      if (response.data.length > 0) {
        setMessages(prev => [...prev, ...response.data])
        
        // Update last message time
        const lastMsg = response.data[response.data.length - 1]
        lastMessageTimeRef.current = lastMsg.createdAt
      }
    } catch (error) {
      console.error('Error polling messages:', error)
    }
  }

  const startPolling = () => {
    stopPolling()
    pollingIntervalRef.current = setInterval(pollNewMessages, POLLING_INTERVAL)
  }

  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || sending) return

    setSending(true)
    try {
      const response = await api.post('/support/messages', {
        message: newMessage.trim()
      })

      const sentMessage = response.data
      setMessages(prev => [...prev, sentMessage])
      setNewMessage('')
      
      // Update last message time
      lastMessageTimeRef.current = sentMessage.createdAt
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Không thể gửi tin nhắn')
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  if (!hasAccess) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8 max-w-4xl">
        <div className="bg-white rounded-lg shadow-md p-6 sm:p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-gray-100 p-3 sm:p-4 rounded-full">
              <Lock className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" />
            </div>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">
            Tính Năng Hỗ Trợ Ưu Tiên
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
            Tính năng chat trực tiếp với admin chỉ khả dụng cho gói Business (299.000đ/tháng).
          </p>
          <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">
            Nâng cấp lên gói Business để được hỗ trợ ưu tiên qua chat real-time với đội ngũ admin.
          </p>
          <a
            href="/bang-gia"
            className="inline-block bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors text-sm sm:text-base"
          >
            Xem Bảng Giá
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-gray-50 sm:relative sm:container sm:mx-auto sm:px-4 sm:py-4 md:py-8 sm:max-w-4xl sm:h-auto">
      <div 
        className="flex flex-col bg-white sm:rounded-lg shadow-md overflow-hidden h-full sm:h-auto" 
        style={{ height: '100vh' }}
      >
        {/* Header */}
        <div className="bg-emerald-600 text-white p-3 sm:p-4 flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
          <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
          <div className="min-w-0">
            <h2 className="text-base sm:text-xl font-bold truncate">Hỗ Trợ Khách Hàng</h2>
            <p className="text-xs sm:text-sm text-emerald-100 truncate">Chat trực tiếp với admin</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 bg-gray-50 min-h-0">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 mt-4 sm:mt-8 px-4">
              <MessageCircle className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-gray-300" />
              <p className="text-sm sm:text-base">Chưa có tin nhắn nào</p>
              <p className="text-xs sm:text-sm mt-1">Gửi tin nhắn để bắt đầu trò chuyện với admin</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg._id}
                className={`flex ${msg.isAdminReply ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[75%] md:max-w-[70%] rounded-lg p-2.5 sm:p-3 ${
                    msg.isAdminReply
                      ? 'bg-white border border-gray-200 shadow-sm'
                      : 'bg-emerald-600 text-white'
                  }`}
                >
                  {msg.isAdminReply && msg.adminId && (
                    <p className="text-xs font-semibold text-emerald-600 mb-1">
                      {msg.adminId.name} (Admin)
                    </p>
                  )}
                  <p className="text-xs sm:text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                  <p
                    className={`text-[10px] sm:text-xs mt-1 ${
                      msg.isAdminReply ? 'text-gray-400' : 'text-emerald-100'
                    }`}
                  >
                    {new Date(msg.createdAt).toLocaleString('vi-VN')}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSendMessage} className="p-3 sm:p-4 bg-white border-t border-gray-200 flex-shrink-0">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Nhập tin nhắn..."
              className="flex-1 px-3 sm:px-4 py-2.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || sending}
              className="bg-emerald-600 text-white px-4 sm:px-6 py-2.5 sm:py-2 rounded-lg hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-colors text-sm sm:text-base font-medium"
            >
              <Send className="w-4 h-4" />
              <span>Gửi</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
