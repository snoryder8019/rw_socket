import express from 'express';
import { checkouts } from './webhooks/orders.js';

export const paypalRouter = express.Router();

paypalRouter.post('/checkouts', checkouts);
//router.get('/pendingOrders', pendingOrders);
//  PayPal Webhooks
