const express = require('express');
const stripe = require('stripe')(process.env.STRIPESECTEST);
const router = express.Router();
const stripeWebhooks = require('./webhook');
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

module.exports = router;
