const express = require('express');
const router = express.Router();
const checkouts = require('./webhooks/orders');


router.post('/checkouts', checkouts);
//router.get('/pendingOrders', pendingOrders);
//  PayPal Webhooks


module.exports = router;