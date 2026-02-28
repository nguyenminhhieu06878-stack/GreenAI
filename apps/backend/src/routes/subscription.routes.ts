import { Router } from 'express'
import {
  getAllSubscriptions,
  getUserSubscriptions,
  createSubscription,
  getCurrentPlan,
  getSubscriptionAccess,
  getRoomLimit
} from '../controllers/subscription.controller'
import { authenticate, AuthRequest } from '../middleware/auth'
import { requireAdmin } from '../middleware/adminAuth'
import { SubscriptionService } from '../services/subscription.service'
import { Response } from 'express'

const router = Router()

router.use(authenticate)

router.get('/my', getUserSubscriptions)
router.get('/current', getCurrentPlan)
router.get('/access', getSubscriptionAccess)
router.get('/room-limit', getRoomLimit)
router.post('/', createSubscription)

// Check PDF export access
router.get('/check-pdf-access', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const result = await SubscriptionService.canExportPDF(userId)
    res.json(result)
  } catch (error) {
    console.error('Check PDF access error:', error)
    res.status(500).json({ error: 'Failed to check PDF access' })
  }
})

// Admin routes
router.get('/all', requireAdmin, getAllSubscriptions)

export default router
