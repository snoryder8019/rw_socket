var express = require('express');
var router = express.Router();
const paypal = require('@paypal/checkout-server-sdk');
const {sendDynamicEmail} = require('../nodemailer/setup')
const config = require('./config');
const { getDb } = require('../../plugins/mongo/mongo');
const {getCardforPaypal, getUserforPaypal,saveOrUpdateOrderForPaypal } = require('./dbFunctions')
const { baseUrl } = require('../../config/config');
const {exporterRoute} = require('../puppeteer/setup');
// Helper function to create PayPal environment
function environment() {
    let clientId = process.env.PPAL_CID;
    let clientSecret = process.env.PPAL_SEC;
    return new paypal.core.SandboxEnvironment(clientId, clientSecret);
}
// Function to create PayPal client
function client() {
    return new paypal.core.PayPalHttpClient(environment());
}
//CREATE ORDERS//
const createOrder = async (req, res) => {
  const address = "1536 14th ave, Greeley, Co 80631";
  const regex = /^[0-9a-zA-Z\s,]+$/;
  const scrubAddy = regex.test(address);
  console.log(scrubAddy);

  try {
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");


    let itemsTotalAmount = req.body.cart.reduce((acc, item) => {
        return acc + parseFloat(item.price);
    }, 0);

    // Set up the request body for the order
    request.requestBody({
        intent: 'CAPTURE',
        purchase_units: [{
            amount: {
                currency_code: 'USD',
                value: req.body.total, // Total amount including any additional charges like shipping or tax
                breakdown: {
                    item_total: {
                        currency_code: 'USD',
                        value: itemsTotalAmount.toFixed(2) // Total price of all items
                    }
                }
            },
            items: req.body.cart.map(item => ({
                name: item.cardName,
                unit_amount: {
                    currency_code: 'USD',
                    value: item.price
                },
                quantity: '1', // Since count is just a description, set quantity to 1
                description: `Item ID: ${item.cartItemId}, Count: ${item.count}`, // Including count as part of the description
                sku: item.cartItemId
            })),
          }],
          payment_source: {
              paypal: {
                  experience_context: {
                      payment_method_preference: "IMMEDIATE_PAYMENT_REQUIRED",
                      brand_name: "Your Brand Name",
                      locale: "en-US",
                      landing_page: "LOGIN",
                      user_action: "PAY_NOW",
                      return_url: baseUrl + "viewBuy/return",
                      cancel_url: baseUrl + "viewBuy/cancel"
                  }
              }
          }
          // Add additional order details as needed
      });

      // Execute the order creation request
      const response = await client().execute(request);

      // Attempt to find the payer-action URL
      const approvalLink = response.result.links.find(link => link.rel === "payer-action");

      if (approvalLink) {
          // Redirect the user to the PayPal checkout page
          res.redirect(approvalLink.href);
      } else {
          console.error("Payer-action link not found in PayPal response.");
          res.status(500).json({ error: "Payer-action link not found in PayPal response." });
      }
  } catch (error) {
      console.error("Failed to create PayPal order:", error);
      res.status(500).json({ error: "Failed to create PayPal order." });
  }
};

// Function to get order details
const getOrderDetails = async (req, res) => {
  console.log('getting details')
  const orderId = req.params.orderId;
const user = req.user
  // Check if the session has order details and if they match the orderId
  if (req.session.orderDetails && req.session.orderDetails.id === orderId) {
      // Render or send order details from the session
      //res.json(req.session.orderDetails)
      res.render('order-details', { orderDetails: req.session.orderDetails, orderId: orderId , user:user});
      req.session.orderDetails = null; // Clear the session order details after use
  } else {
      res.status(404).send('Order details not found in session.');
  }
};




router.get('/capture-payment/:orderId', async (req, res) => {
  const orderId = req.params.orderId;
  
  try {
    const captureRequest = new paypal.orders.OrdersCaptureRequest(orderId);
    const captureResponse = await client().execute(captureRequest);
    
    // Handle capture response
    // ...
    
  } catch (error) {
    console.error("Error capturing PayPal payment:", error);
    res.status(500).json({ error: "Error capturing payment." });
  }
});
const returnPaypalSuccess = async (req, res) => {
  console.log('hit dat shit');
  const { token, PayerID } = req.query;
  console.log(PayerID);
  
  if (!token || !PayerID) {
    return res.status(400).send('Payment token or PayerID is missing.');
  }
  
  try {
    // Capture the payment
    const captureRequest = new paypal.orders.OrdersCaptureRequest(token);
    captureRequest.requestBody({});
    const captureResponse = await client().execute(captureRequest);
    
    // Fetch detailed order information
    const orderDetailsRequest = new paypal.orders.OrdersGetRequest(token);
    const orderDetailsResponse = await client().execute(orderDetailsRequest);
    
    // Store order details in session
    req.session.orderDetails = orderDetailsResponse.result;
  
    
    // Redirect to the checkout awaiting page
    res.redirect('/viewBuy/checkout-awaiting?orderId=' + token);
  } catch (error) {
    console.error("Error capturing PayPal payment:", error);
    res.status(500).send('Error capturing payment.');
  }
};

// Setup the /return route to handle PayPal return
router.get('/return', async (req, res) => {
  await returnPaypalSuccess(req, res);
});
// const getCheckoutAwaiting = async  (req, res) => {
//   const orderId = req.query.orderId;
  
//   if (req.session.orderDetails && req.session.orderDetails.id === orderId) {
//     res.render('checkout-awaiting', { orderId: orderId });
//   } else {
//     res.status(404).send('Order details not found. Please try again.');
//   }
// }



const getCheckoutAwaiting = async (req, res, card) => {
  console.log('getCheckoutAwaiting called');
  const userId = req.query.userId;
  const cardId = req.query.cardId;
  const customId = req.query.customId;

  const confirmationId = req.query.orderId; // Assuming this is your PayPal order ID
const user = req.user
const userEmail = req.user.email  
console.log(`Received query parameters - UserID: ${userId}, CardID: ${cardId}, OrderID: ${customId}`);

  if (!userId || !customId) {
    console.log('Order details missing');
    return res.status(404).send('Order details not found. Please try again.');
  }

  try {
    console.log('Fetching user for PayPal');
    const pplFuncUser = await getUserforPaypal(userId);

    console.log('Fetching card for PayPal');
    const pplFuncCard = await getCardforPaypal(cardId);

    if (!pplFuncUser || !pplFuncCard) {
      console.log('User or Card details not found');
      return res.status(404).send('User or Card details not found.');
    }
const otherData = {
  "customId":customId,
  "userId":userId,
  "cardId":cardId,
  "userEmail":userEmail, 
  "paypalApproved":"false",
  "sentToPrint":"false",
  "paypalCompleted":"false",
  "paypalCanceled":"false",
  "trackingId":"",
  "orderDate":new Date()


}
    console.log('Calling exporterRoute');
   // const ppalFuncOrder = await postOrderForPaypal(userId,CardId,confirmationId)
   //THIS IS TH PDF SCRAPER BELOW!!!!!!!!!!!!!
   // await exporterRoute(req, res, userId, cardId,  confirmationId);
await saveOrUpdateOrderForPaypal(customId,otherData)
// Example usage
sendDynamicEmail(
  'm.scott.wallace@gmail.com', 
  'orderComplete', 
  { firstName: user.firstName }, // User object
  null, // Card object (optional)
  'https://example.com/confirm' // Dynamic link
);
sendDynamicEmail(
  'w2marketing.scott@gmail.com', 
  'orderNotify', 
  { firstName: user.firstName }, // User object
  null, // Card object (optional)
  'https://example.com/confirm' // Dynamic link
);

    console.log('Rendering checkout-awaiting view');
    console.log(user)
    console.log(card)
    console.log(pplFuncCard)
    res.render('checkout-awaiting', {user:user, card:pplFuncCard, orderId: customId });
  return;
  } catch (error) {
    console.error('Error in getCheckoutAwaiting:', error);
    res.status(500).send('An error occurred while fetching details.');
  }
};




//https://royal.w2marketing.biz/return?token=81S79030XA1366023&PayerID=WU3XH23UWEGVJ
module.exports = {createOrder, getOrderDetails, returnPaypalSuccess, getCheckoutAwaiting}