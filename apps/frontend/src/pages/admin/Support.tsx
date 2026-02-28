import { useState, useEffect, useRef } from 'react'
import { MessageCircle, Send, Users } from 'lucide-react'
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

interface Chat {
  userId: string
  userName: string
  userEmail: string
  lastMessage: string
  lastMessageTime: string
  status: string
  unreadCount: number
}

const POLLING_INTERVAL = 3000 // Poll every 3 seconds

export default function AdminSupport() {
  const [chats, setChats] = useState<Chat[]>([])
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const chatPollingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastMessageTimeRef = useRef<string>(new Date(0).toISOString())

  useEffect(() => {
    loadChats()
    startChatPolling()

    return () => {
      stopChatPolling()
      stopMessagePolling()
    }
  }, [])

  useEffect(() => {
    if (selectedUserId) {
      loadMessages(selectedUserId)
      startMessagePolling()
    } else {
      stopMessagePolling()
    }
  }, [selectedUserId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadChats = async () => {
    try {
      const response = await api.get('/support/admin/chats')
      setChats(response.data)
    } catch (error) {
      console.error('Error loading chats:', error)
      toast.error('Không thể tải danh sách chat')
    } finally {
      setLoading(false)
    }
  }

  const loadMessages = async (userId: string) => {
    try {
      const response = await api.get(`/support/admin/chats/${userId}`)
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
    if (!selectedUserId) return
    
    try {
      const response = await api.get(`/support/admin/chats/${selectedUserId}/new`, {
        params: { since: lastMessageTimeRef.current }
      })
      
      if (response.data.length > 0) {
        setMessages(prev => [...prev, ...response.data])
        
        // Update last message time
        const lastMsg = response.data[response.data.length - 1]
        lastMessageTimeRef.current = lastMsg.createdAt
        
        // Reload chats to update unread count
        loadChats()
      }
    } catch (error) {
      console.error('Error polling messages:', error)
    }
  }

  const startMessagePolling = () => {
    stopMessagePolling()
    pollingIntervalRef.current = setInterval(pollNewMessages, POLLING_INTERVAL)
  }

  const stopMessagePolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
    }
  }

  const startChatPolling = () => {
    stopChatPolling()
    chatPollingIntervalRef.current = setInterval(loadChats, POLLING_INTERVAL * 2) // Poll chats every 6 seconds
  }

  const stopChatPolling = () => {
    if (chatPollingIntervalRef.current) {
      clearInterval(chatPollingIntervalRef.current)
      chatPollingIntervalRef.current = null
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || sending || !selectedUserId) return

    setSending(true)
    try {
      const response = await api.post(`/support/admin/chats/${selectedUserId}/reply`, {
        message: newMessage.trim()
      })

      const sentMessage = response.data
      setMessages(prev => [...prev, sentMessage])
      setNewMessage('')
      
      // Update last message time
      lastMessageTimeRef.current = sentMessage.createdAt

      // Reload chats to update status
      loadChats()
    } catch (error) {
      console.error('Error sending reply:', error)
      toast.error('Không thể gửi tin nhắn')
    } finally {
      setSending(false)
    }
  }

  const selectedChat = chats.find(c => c.userId === selectedUserId)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <div className="bg-white border-b border-gray-200 p-3 sm:p-4">
        <h1 className="text-lg sm:text-2xl font-bold text-gray-800 flex items-center">
          <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-emerald-600" />
          Hỗ Trợ Khách Hàng
        </h1>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Chat List */}
        <div className={`${selectedUserId ? 'hidden md:block' : 'block'} w-full md:w-80 bg-white border-r border-gray-200 overflow-y-auto`}>
          <div className="p-3 sm:p-4 border-b border-gray-200">
            <h2 className="text-sm sm:text-base font-semibold text-gray-700 flex items-center">
              <Users className="w-4 h-4 mr-2" />
              Danh Sách Chat ({chats.length})
            </h2>
          </div>
          {chats.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <MessageCircle className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 text-gray-300" />
              <p className="text-xs sm:text-sm">Chưa có tin nhắn nào</p>
            </div>
          ) : (
            <div>
              {chats.map((chat) => (
                <div
                  key={chat.userId}
                  onClick={() => setSelectedUserId(chat.userId)}
                  className={`p-3 sm:p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedUserId === chat.userId ? 'bg-emerald-50 border-l-4 border-l-emerald-600' : ''
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="text-sm sm:text-base font-semibold text-gray-800 truncate flex-1 min-w-0 mr-2">{chat.userName}</h3>
                    {chat.unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full flex-shrink-0">
                        {chat.unreadCount}
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 truncate">{chat.lastMessage}</p>
                  <p className="text-[10px] sm:text-xs text-gray-400 mt-1">
                    {new Date(chat.lastMessageTime).toLocaleString('vi-VN')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Chat Messages */}
        <div className={`${selectedUserId ? 'flex' : 'hidden md:flex'} flex-1 flex-col`}>
          {selectedUserId ? (
            <>
              {/* Chat Header */}
              <div className="bg-white border-b border-gray-200 p-3 sm:p-4 flex items-center gap-2">
                <button
                  onClick={() => setSelectedUserId(null)}
                  className="md:hidden flex-shrink-0 p-2 -ml-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Quay lại danh sách"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div className="min-w-0 flex-1">
                  <h2 className="text-sm sm:text-base font-semibold text-gray-800 truncate">{selectedChat?.userName}</h2>
                  <p className="text-xs sm:text-sm text-gray-500 truncate">{selectedChat?.userEmail}</p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-500 mt-4 sm:mt-8">
                    <MessageCircle className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-gray-300" />
                    <p className="text-sm sm:text-base">Chưa có tin nhắn nào</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg._id}
                      className={`flex ${msg.isAdminReply ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] sm:max-w-[75%] md:max-w-[70%] rounded-lg p-2.5 sm:p-3 ${
                          msg.isAdminReply
                            ? 'bg-emerald-600 text-white'
                            : 'bg-white border border-gray-200 shadow-sm'
                        }`}
                      >
                        {msg.isAdminReply && msg.adminId && (
                          <p className="text-xs font-semibold text-emerald-100 mb-1">
                            {msg.adminId.name} (Bạn)
                          </p>
                        )}
                        <p className="text-xs sm:text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                        <p
                          className={`text-[10px] sm:text-xs mt-1 ${
                            msg.isAdminReply ? 'text-emerald-100' : 'text-gray-400'
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

              {/* Reply Input */}
              <form onSubmit={handleSendReply} className="p-3 sm:p-4 bg-white border-t border-gray-200">
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
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <div className="text-center px-4">
                <MessageCircle className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4" />
                <p className="text-sm sm:text-base">Chọn một cuộc trò chuyện để bắt đầu</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
