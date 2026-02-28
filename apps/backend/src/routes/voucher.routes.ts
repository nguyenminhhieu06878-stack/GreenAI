import { Router } from 'express'
import { randomVoucher } from '../controllers/voucherTemplate.controller'
import { authenticate } from '../middleware/auth'

const router = Router()

router.use(authenticate)

// User can random a voucher
router.post('/random', randomVoucher)

export default router
