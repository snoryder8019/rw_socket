const express = require('express');
const router = express.Router();
const { connect } = require('./mongo/mongo');  // MongoDB connection logic
const {exporter} = require('./puppeteer/setup')
const {oauthCallbackHandler, emailOutGeneral} = require('./nodemailer/setup')
const setupShopifyRoutes = require('./shopify-storefront/setup');
const stripeRoutes = require('./stripe');
connect().catch(err => console.error("Failed to connect to MongoDB:", err));

router.post('/emailOutGeneral', emailOutGeneral)

router.use('/stripe', stripeRoutes);
router.get('/exporter', exporter);
router.get('/oauth/callback',oauthCallbackHandler)
router.use('/shopify-storefront',setupShopifyRoutes);



const { router: passportRouter } = require('./passport/localStrat');
router.use(passportRouter);

module.exports = router