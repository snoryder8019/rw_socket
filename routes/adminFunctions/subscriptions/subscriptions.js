const express = require('express');
const router = express.Router();
const Subscription = require('../../../plugins/mongo/models/Subscription');
const { ObjectId } = require('mongodb');

// Route to get all subscriptions with action buttons
router.get('/load', async (req, res) => {
  try {
    const subscriptions = await Subscription.getAll();
    const subscriptionHtml = subscriptions.map(subscription => `
      <div class="subscription">
        <p>${subscription.name}</p>
        <p>Type: ${subscription.type}</p>
        <p>Price: $${subscription.price}</p>
        <form action="/subscriptions/editSubscription" method="POST">
          <input type="hidden" name="id" value="${subscription._id}">
          <button type="submit">Edit Subscription</button>
        </form>
        <form action="/subscriptions/deleteSubscription" method="POST">
          <input type="hidden" name="id" value="${subscription._id}">
          <button type="submit">Delete Subscription</button>
        </form>
      </div>
    `).join('');

    res.send(`
      <h1>Subscriptions</h1>
      <div id="subscriptionList">
        ${subscriptionHtml}
      </div>

      <h2>Create New Subscription</h2>
      <form class=adminForms action="/subscriptions/addSubscription" method="POST">
        <label for="name">Name:</label>
        <input type="text" name="name" id="name">
        <label for="type">Type:</label>
        <input type="text" name="type" id="type">
        <label for="price">Price:</label>
        <input type="number" name="price" id="price">
        <label for="endDate">End Date:</label>
        <input type="date" name="endDate" id="endDate">
        <label for="mediumIcon">Medium Icon:</label>
        <input type="file" name="mediumIcon" id="mediumIcon">
        <label for="squareNonAuthBkgd">Square Non-Auth Background:</label>
        <input type="file" name="squareNonAuthBkgd" id="squareNonAuthBkgd">
        <label for="squareAuthBkgd">Square Auth Background:</label>
        <input type="file" name="squareAuthBkgd" id="squareAuthBkgd">
        <label for="horizNonAuthBkgd">Horiz Non-Auth Background:</label>
        <input type="file" name="horizNonAuthBkgd" id="horizNonAuthBkgd">
        <label for="horizAuthBkgd">Horiz Auth Background:</label>
        <input type="file" name="horizAuthBkgd" id="horizAuthBkgd">
        <label for="nonAuthTitle">Non-Auth Title:</label>
        <input type="text" name="nonAuthTitle" id="nonAuthTitle">
        <label for="nonAuthDescription">Non-Auth Description:</label>
        <textarea name="nonAuthDescription" id="nonAuthDescription"></textarea>
        <label for="authTitle">Auth Title:</label>
        <input type="text" name="authTitle" id="authTitle">
        <label for="authDescription">Auth Description:</label>
        <textarea name="authDescription" id="authDescription"></textarea>
        <label for="daysSubscribed">Days Subscribed:</label>
        <input type="number" name="daysSubscribed" id="daysSubscribed">
        <label for="gemsType">Gems Type:</label>
        <input type="text" name="gemsType" id="gemsType">
        <label for="gemsCt">Gems Count:</label>
        <input type="number" name="gemsCt" id="gemsCt">
        <label for="items">Items:</label>
        <input type="text" name="items" id="items">
        <label for="vendors">Vendors:</label>
        <input type="text" name="vendors" id="vendors">
        <label for="gameTokens">Game Tokens:</label>
        <input type="number" name="gameTokens" id="gameTokens">
        <button type="submit">Add Subscription</button>
      </form>
    `);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'An error occurred while fetching subscription data' });
  }
});

// Route to add a new subscription
router.post('/addSubscription', async (req, res) => {
  try {
    const {
      name, type, price, endDate,
      mediumIcon, squareNonAuthBkgd, squareAuthBkgd,
      horizNonAuthBkgd, horizAuthBkgd, nonAuthTitle,
      nonAuthDescription, authTitle, authDescription,
      daysSubscribed, gemsCt, items, vendors, gameTokens
    } = req.body;

    const newSubscription = new Subscription({
      name, type, price, endDate,
      mediumIcon, squareNonAuthBkgd, squareAuthBkgd,
      horizNonAuthBkgd, horizAuthBkgd, nonAuthTitle,
      nonAuthDescription, authTitle, authDescription,
      daysSubscribed, gemsCt, items: items.split(','), vendors: vendors.split(','), gameTokens
    });

    await Subscription.create(newSubscription);
    req.flash('success_msg', 'New subscription created!');
    res.redirect('/subscriptions/load');
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'An error occurred while adding the subscription');
    res.status(500).send({ error: 'An error occurred while adding the subscription' });
  }
});

// Route to delete a subscription
router.post('/deleteSubscription', async (req, res) => {
  try {
    const { id } = req.body;
    await Subscription.deleteById(id);
    req.flash('success_msg', 'Subscription deleted!');
    res.redirect('/subscriptions/load');
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'An error occurred while deleting the subscription');
    res.status(500).send({ error: 'An error occurred while deleting the subscription' });
  }
});

// Route to edit a subscription and render the generalEditor view
router.post('/editSubscription', async (req, res) => {
  try {
    const { id } = req.body;
    const subscription = await Subscription.getById(id);
    if (!subscription) {
      return res.status(404).send({ error: 'Subscription not found' });
    }
    res.render('generalEditor', { model: 'Subscription', data: subscription });
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'An error occurred while fetching the subscription data');
    res.status(500).send({ error: 'An error occurred while fetching the subscription data' });
  }
});

// Route to update a subscription
router.post('/updateSubscription', async (req, res) => {
  try {
    const {
      id, name, type, price, endDate,
      mediumIcon, squareNonAuthBkgd, squareAuthBkgd,
      horizNonAuthBkgd, horizAuthBkgd, nonAuthTitle,
      nonAuthDescription, authTitle, authDescription,
      daysSubscribed, gemsCt, items, vendors, gameTokens
    } = req.body;

    const updatedSubscription = {
      name, type, price, endDate,
      mediumIcon, squareNonAuthBkgd, squareAuthBkgd,
      horizNonAuthBkgd, horizAuthBkgd, nonAuthTitle,
      nonAuthDescription, authTitle, authDescription,
      daysSubscribed, gemsCt, items: items.split(','), vendors: vendors.split(','), gameTokens
    };

    await Subscription.updateById(id, updatedSubscription);
    req.flash('success_msg', 'Subscription updated successfully');
    res.redirect('/subscriptions/load');
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'An error occurred while updating the subscription');
    res.status(500).send({ error: 'An error occurred while updating the subscription' });
  }
});

module.exports = router;
