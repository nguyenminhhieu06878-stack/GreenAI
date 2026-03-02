import { Router } from 'express'
import { authenticate } from '../middleware/auth.js'
import { requireAdmin } from '../middleware/adminAuth.js'
import { getTrainingData, getTrainingStats } from '../controllers/ocrTraining.controller.js'

const router = Router()

// Admin only routes
router.get('/data', authenticate, requireAdmin, getTrainingData)
router.get('/stats', authenticate, requireAdmin, getTrainingStats)

export default router
