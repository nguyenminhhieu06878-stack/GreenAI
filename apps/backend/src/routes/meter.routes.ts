import { Router } from 'express'
import { uploadMeterImage, addManualReading, getReadings, updateReading, deleteReading } from '../controllers/meter.controller'
import { authenticate } from '../middleware/auth'
import { upload } from '../middleware/upload'

const router = Router()

router.post('/upload', authenticate, upload.single('image'), uploadMeterImage)
router.post('/manual', authenticate, addManualReading)
router.get('/readings', authenticate, getReadings)
router.put('/readings/:id', authenticate, updateReading)
router.delete('/readings/:id', authenticate, deleteReading)

export default router
