// Using require for PayOS due to ESM/CJS compatibility issues
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PayOS: PayOSClass } = require('@payos/node');

let payOS: any;

async function initPayOS() {
  if (!payOS) {
    payOS = new PayOSClass({
      clientId: process.env.PAYOS_CLIENT_ID!,
      apiKey: process.env.PAYOS_API_KEY!,
      checksumKey: process.env.PAYOS_CHECKSUM_KEY!
    });
  }
  return payOS;
}

export interface CreatePaymentData {
  orderCode: number;
  amount: number;
  description: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone?: string;
  returnUrl: string;
  cancelUrl: string;
}

export const createPaymentLink = async (data: CreatePaymentData) => {
  try {
    const payOSInstance = await initPayOS();
    const paymentLinkResponse = await payOSInstance.paymentRequests.create({
      orderCode: data.orderCode,
      amount: data.amount,
      description: data.description,
      buyerName: data.buyerName,
      buyerEmail: data.buyerEmail,
      buyerPhone: data.buyerPhone,
      returnUrl: data.returnUrl,
      cancelUrl: data.cancelUrl,
      items: [{
        name: data.description,
        quantity: 1,
        price: data.amount
      }]
    });

    return paymentLinkResponse;
  } catch (error) {
    console.error('PayOS Error:', error);
    throw error;
  }
};

export const verifyPaymentWebhook = async (webhookData: any) => {
  try {
    const payOSInstance = await initPayOS();
    const verifiedData = await payOSInstance.webhooks.verify(webhookData);
    return verifiedData;
  } catch (error) {
    console.error('Webhook verification failed:', error);
    throw error;
  }
};

export const getPaymentInfo = async (orderCode: number) => {
  try {
    const payOSInstance = await initPayOS();
    const paymentInfo = await payOSInstance.paymentRequests.get(orderCode);
    return paymentInfo;
  } catch (error) {
    console.error('Get payment info error:', error);
    throw error;
  }
};
