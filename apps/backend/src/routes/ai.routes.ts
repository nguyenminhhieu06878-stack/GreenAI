import { Router } from 'express'
import {
  chat,
  analyzeConsumption,
  detectAnomalies,
  getSavingsTips
} from '../controllers/ai.controller.js'
import { authenticate } from '../middleware/auth.js'
import { SubscriptionService } from '../services/subscription.service.js'
import { Response } from 'express'
import { AuthRequest } from '../middleware/auth.js'

const router = Router()

router.use(authenticate)

// Check AI Insights access
router.get('/check-insights-access', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const result = await SubscriptionService.canUseAIInsights(userId)
    res.json(result)
  } catch (error) {
    console.error('Check AI Insights access error:', error)
    res.status(500).json({ error: 'Failed to check AI Insights access' })
  }
})

router.post('/chat', chat)
router.get('/analyze', analyzeConsumption)
router.get('/anomalies', detectAnomalies)
router.get('/tips', getSavingsTips)

export default router
