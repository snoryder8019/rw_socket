const express = require('express');
const stripe = require('stripe')(process.env.STRIPESECTEST);
const bodyParser = require('body-parser');
const router = express.Router();

const endpointSecret = 'YOUR_ENDPOINT_SECRET';  // Set this in your environment variables

router.post('/webhook', bodyParser.raw({type: 'application/json'}), (req, res) => {
    const sig = req.headers['stripe-signature'];

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'charge.succeeded':
            // Handle successful charge
            break;
        // Add more event types as needed
    }

    res.status(200).send({received: true});
});

module.exports = router;
