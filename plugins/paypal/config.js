// /plugins/paypal.js

const { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET } = process.env;

module.exports = {
  clientID: PAYPAL_CLIENT_ID,
  clientSecret: PAYPAL_CLIENT_SECRET,
};
