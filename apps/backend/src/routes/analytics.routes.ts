import { Router } from 'express'
import { getDashboardStats, getConsumptionChart, getTips, getInvoice } from '../controllers/analytics.controller'
import { authenticate } from '../middleware/auth'
import { SubscriptionService } from '../services/subscription.service'
import { Response } from 'express'
import { AuthRequest } from '../middleware/auth'

const router = Router()

// Check analytics access
router.get('/check-access', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const result = await SubscriptionService.canAccessAnalytics(userId)
    res.json(result)
  } catch (error) {
    console.error('Check analytics access error:', error)
    res.status(500).json({ error: 'Failed to check analytics access' })
  }
})

router.get('/dashboard', authenticate, getDashboardStats)
router.get('/consumption', authenticate, getConsumptionChart)
router.get('/tips', authenticate, getTips)
router.get('/invoice', authenticate, getInvoice)

export default router
