import { Router } from 'express'
import { getCheckInStatus, checkIn, getVouchers, validateVoucher, useVoucher } from '../controllers/checkin.controller.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

router.use(authenticate)

router.get('/status', getCheckInStatus)
router.post('/check-in', checkIn)
router.get('/vouchers', getVouchers)
router.post('/validate-voucher', validateVoucher)
router.post('/use-voucher', useVoucher)

export default router
