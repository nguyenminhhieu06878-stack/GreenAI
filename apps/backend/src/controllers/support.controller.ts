import { Response } from 'express'
import { AuthRequest } from '../middleware/auth'
import SupportMessage from '../models/SupportMessage.model'
import { SubscriptionService } from '../services/subscription.service'

export const checkSupportAccess = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const canUseSupport = await SubscriptionService.canUseSupport(userId)
    res.json({ hasAccess: canUseSupport })
  } catch (error) {
    console.error('Error checking support access:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

export const getMessages = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const canUseSupport = await SubscriptionService.canUseSupport(userId)
    if (!canUseSupport) {
      return res.status(403).json({ message: 'Support chat is only available for Business plan' })
    }

    const messages = await SupportMessage.find({ userId })
      .populate('adminId', 'name email')
      .sort({ createdAt: 1 })
      .lean()

    res.json(messages)
  } catch (error) {
    console.error('Error fetching messages:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const canUseSupport = await SubscriptionService.canUseSupport(userId)
    if (!canUseSupport) {
      return res.status(403).json({ message: 'Support chat is only available for Business plan' })
    }

    const { message } = req.body
    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Message is required' })
    }

    const newMessage = await SupportMessage.create({
      userId,
      message: message.trim(),
      isAdminReply: false,
      status: 'open'
    })

    const populatedMessage = await SupportMessage.findById(newMessage._id)
      .populate('adminId', 'name email')
      .lean()

    res.status(201).json(populatedMessage)
  } catch (error) {
    console.error('Error sending message:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Get new messages since timestamp (for polling)
export const getNewMessages = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const canUseSupport = await SubscriptionService.canUseSupport(userId)
    if (!canUseSupport) {
      return res.status(403).json({ message: 'Support chat is only available for Business plan' })
    }

    const { since } = req.query
    const sinceDate = since ? new Date(since as string) : new Date(0)

    const newMessages = await SupportMessage.find({
      userId,
      createdAt: { $gt: sinceDate }
    })
      .populate('adminId', 'name email')
      .sort({ createdAt: 1 })
      .lean()

    res.json(newMessages)
  } catch (error) {
    console.error('Error fetching new messages:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Admin endpoints
export const getAllSupportChats = async (req: AuthRequest, res: Response) => {
  try {
    const chats = await SupportMessage.aggregate([
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: '$userId',
          lastMessage: { $first: '$message' },
          lastMessageTime: { $first: '$createdAt' },
          status: { $first: '$status' },
          unreadCount: {
            $sum: {
              $cond: [{ $and: [{ $eq: ['$isAdminReply', false] }, { $eq: ['$status', 'open'] }] }, 1, 0]
            }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          userId: '$_id',
          userName: '$user.name',
          userEmail: '$user.email',
          lastMessage: 1,
          lastMessageTime: 1,
          status: 1,
          unreadCount: 1
        }
      }
    ])

    res.json(chats)
  } catch (error) {
    console.error('Error fetching support chats:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Get new messages for admin (polling)
export const getNewChatMessages = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params
    const { since } = req.query
    const sinceDate = since ? new Date(since as string) : new Date(0)

    const newMessages = await SupportMessage.find({
      userId,
      createdAt: { $gt: sinceDate }
    })
      .populate('adminId', 'name email')
      .sort({ createdAt: 1 })
      .lean()

    res.json(newMessages)
  } catch (error) {
    console.error('Error fetching new chat messages:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

export const getChatMessages = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params

    const messages = await SupportMessage.find({ userId })
      .populate('adminId', 'name email')
      .sort({ createdAt: 1 })
      .lean()

    res.json(messages)
  } catch (error) {
    console.error('Error fetching chat messages:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

export const replyToUser = async (req: AuthRequest, res: Response) => {
  try {
    const adminId = req.user?.id
    const { userId } = req.params
    const { message } = req.body

    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Message is required' })
    }

    const newMessage = await SupportMessage.create({
      userId,
      message: message.trim(),
      isAdminReply: true,
      adminId,
      status: 'replied'
    })

    const populatedMessage = await SupportMessage.findById(newMessage._id)
      .populate('adminId', 'name email')
      .lean()

    res.status(201).json(populatedMessage)
  } catch (error) {
    console.error('Error replying to user:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
