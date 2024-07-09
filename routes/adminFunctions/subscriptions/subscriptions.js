const express = require('express');
const { ObjectId } = require('mongodb');
const Subscription = require('../../../plugins/mongo/models/Subscription');
const { generateFormFields } = require('../../../plugins/helpers/formHelper');
const { subscriptionUpload, processSubscriptionImage } = require('../../../plugins/multer/subscriptionSetup');const router = express.Router();



// Define file fields for multer
const fileFields = [
  { name: 'mediumIcon', maxCount: 1 },
  { name: 'squareNonAuthBkgd', maxCount: 1 },
  { name: 'squareAuthBkgd', maxCount: 1 },
  { name: 'horizNonAuthBkgd', maxCount: 1 },
  { name: 'horizAuthBkgd', maxCount: 1 }
];

// Array of file field names for form generation
const fileFieldNames = fileFields.map(field => field.name);

// Route to render the form to add a new subscription
router.get('/renderAddForm', (req, res) => {
  try {
    const model = {
      name: '',
      type: '',
      price: '',
      startDate: '',
      endDate: '',
      mediumIcon: '',
      squareNonAuthBkgd: '',
      squareAuthBkgd: '',
      horizNonAuthBkgd: '',
      horizAuthBkgd: '',
      nonAuthTitle: '',
      nonAuthDescription: '',
      authTitle: '',
      authDescription: '',
      daysSubscribed: '',
      gemsType: '',
      gemsCt: '',
      items: '',
      vendors: '',
      gameTokens: ''
    }; // Empty model for new subscription

    res.render('forms/generalForm', {
      title: 'Add New Subscription',
      action: '/subscriptions/create',
      model: model,
      generateFormFields: generateFormFields,
      fileFields: fileFieldNames
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

// Route to create a subscription
router.post('/create', subscriptionUpload.fields(fileFields), processSubscriptionImage, async (req, res) => {
  try {
    const subscriptionData = req.body;
    const subscription = new Subscription(subscriptionData);
    const result = await subscription.create(subscriptionData);
    res.status(201).send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

// Route to get all subscriptions
router.get('/all', async (req, res) => {
  try {
    const subscriptions = await Subscription.getAll();
    res.status(200).send(subscriptions);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

// Route to get a subscription by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).send({ error: 'Invalid ID format' });
    }
    const subscription = await Subscription.getById(id);
    res.status(200).send(subscription);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

// Route to update a subscription by ID
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).send({ error: 'Invalid ID format' });
    }
    const updatedSubscription = req.body;
    const result = await Subscription.updateById(id, updatedSubscription);
    res.status(200).send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

// Route to delete a subscription by ID
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).send({ error: 'Invalid ID format' });
    }
    const result = await Subscription.deleteById(id);
    res.status(200).send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

module.exports = router;
