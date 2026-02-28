import { Response } from 'express'
import { AuthRequest } from '../middleware/auth'
import { AIService } from '../services/ai.service'
import { SubscriptionService } from '../services/subscription.service'

// Chat with AI
export const chat = async (req: AuthRequest, res: Response) => {
  try {
    const { message, conversationHistory } = req.body
    const userId = req.user?.id

    if (!message) {
      return res.status(400).json({ error: 'Message is required' })
    }

    // Check if user can use AI
    const canUseAI = await SubscriptionService.canUseAI(userId!)
    if (!canUseAI.allowed) {
      return res.status(403).json({ error: canUseAI.message })
    }

    const result = await AIService.chat(userId!, message, conversationHistory || [])

    res.json({
      ...result,
      aiAccessSource: canUseAI.source
    })
  } catch (error) {
    console.error('AI chat error:', error)
    res.status(500).json({ error: 'Failed to get AI response' })
  }
}

// Analyze consumption patterns
export const analyzeConsumption = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id
    const { roomId } = req.query

    // Check if user can use AI
    const canUseAI = await SubscriptionService.canUseAI(userId!)
    if (!canUseAI.allowed) {
      return res.status(403).json({ error: canUseAI.message })
    }

    const analysis = await AIService.analyzeConsumption(userId!, roomId as string)

    res.json({
      ...analysis,
      aiAccessSource: canUseAI.source
    })
  } catch (error) {
    console.error('Analyze consumption error:', error)
    res.status(500).json({ error: 'Failed to analyze consumption' })
  }
}

// Detect anomalies
export const detectAnomalies = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id
    const { roomId } = req.query

    // Check if user can use AI
    const canUseAI = await SubscriptionService.canUseAI(userId!)
    if (!canUseAI.allowed) {
      return res.status(403).json({ error: canUseAI.message })
    }

    const result = await AIService.detectAnomalies(userId!, roomId as string)

    res.json({
      ...result,
      aiAccessSource: canUseAI.source
    })
  } catch (error) {
    console.error('Detect anomalies error:', error)
    res.status(500).json({ error: 'Failed to detect anomalies' })
  }
}

// Get savings tips
export const getSavingsTips = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id
    const { roomId } = req.query

    // Check if user can use AI
    const canUseAI = await SubscriptionService.canUseAI(userId!)
    if (!canUseAI.allowed) {
      return res.status(403).json({ error: canUseAI.message })
    }

    const result = await AIService.generateSavingsTips(userId!, roomId as string)

    res.json({
      ...result,
      aiAccessSource: canUseAI.source
    })
  } catch (error) {
    console.error('Get savings tips error:', error)
    res.status(500).json({ error: 'Failed to get savings tips' })
  }
}
