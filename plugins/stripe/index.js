import express from 'express';
import stripe from 'stripe';
import stripeWebhooks from './webhook.js';

const router = express.Router();
router.use('/stripe', stripeWebhooks);
router.post('/charge', async (req, res) => {
  try {
    const { amount, token } = req.body;
    const charge = await stripe.charges.create({
      amount,
      currency: 'usd',
      description: 'Description of your product/service',
      source: token,
    });

    res.status(200).send(charge);
  } catch (err) {
    res.status(500).send({ error: 'Charge Failed' });
    console.error(err);
  }
});

export default router;
