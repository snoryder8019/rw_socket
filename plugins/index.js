import express from 'express';
import { connect } from './mongo/mongo.js';
import { exporter } from './puppeteer/setup.js';
import { oauthCallbackHandler, emailOutGeneral } from './nodemailer/setup.js';
import setupShopifyRoutes from './shopify-storefront/setup.js';
import stripeRoutes from './stripe/index.js';

const router = express.Router();

connect().catch((err) => console.error('Failed to connect to MongoDB:', err));

router.post('/emailOutGeneral', emailOutGeneral);

router.use('/stripe', stripeRoutes);
router.get('/exporter', exporter);
router.get('/oauth/callback', oauthCallbackHandler);
router.use('/shopify-storefront', setupShopifyRoutes);

const { router: passportRouter } = require('./passport/localStrat');
router.use(passportRouter);

export default router;
