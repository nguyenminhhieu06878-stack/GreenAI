import { Router } from 'express'
import { getCheckInStatus, checkIn, getVouchers, validateVoucher, useVoucher } from '../controllers/checkin.controller'
import { authenticate } from '../middleware/auth'

const router = Router()

router.use(authenticate)

router.get('/status', getCheckInStatus)
router.post('/check-in', checkIn)
router.get('/vouchers', getVouchers)
router.post('/validate-voucher', validateVoucher)
router.post('/use-voucher', useVoucher)

export default router
