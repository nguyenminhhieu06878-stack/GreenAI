import { Router } from 'express'
import { authenticate } from '../middleware/auth.js'
import { requireAdmin } from '../middleware/adminAuth.js'
import {
  checkSupportAccess,
  getMessages,
  sendMessage,
  getNewMessages,
  getAllSupportChats,
  getChatMessages,
  getNewChatMessages,
  replyToUser
} from '../controllers/support.controller.js'

const router = Router()

// User endpoints
router.get('/check-access', authenticate, checkSupportAccess)
router.get('/messages', authenticate, getMessages)
router.get('/messages/new', authenticate, getNewMessages) // For polling
router.post('/messages', authenticate, sendMessage)

// Admin endpoints
router.get('/admin/chats', authenticate, requireAdmin, getAllSupportChats)
router.get('/admin/chats/:userId', authenticate, requireAdmin, getChatMessages)
router.get('/admin/chats/:userId/new', authenticate, requireAdmin, getNewChatMessages) // For polling
router.post('/admin/chats/:userId/reply', authenticate, requireAdmin, replyToUser)

export default router
