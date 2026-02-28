import express from 'express';
import { authenticate } from '../middleware/auth';
import {
  createPayment,
  handlePaymentWebhook,
  checkPaymentStatus,
  validateVoucher
} from '../controllers/payment.controller';

const router = express.Router();

router.post('/create', authenticate, createPayment);
router.post('/webhook', handlePaymentWebhook); // No auth - PayOS calls this
router.get('/status/:orderCode', authenticate, checkPaymentStatus);
router.post('/validate-voucher', authenticate, validateVoucher);

export default router;
