import { Router } from 'express'
import { randomVoucher } from '../controllers/voucherTemplate.controller.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

router.use(authenticate)

// User can random a voucher
router.post('/random', randomVoucher)

export default router
