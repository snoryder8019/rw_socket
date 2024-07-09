const express = require('express');
const { ObjectId } = require('mongodb');
const Subscription = require('../../../plugins/mongo/models/Subscription');
const { generateFormFields } = require('../../../plugins/helpers/formHelper');
const { upload, processImages } = require('../../../plugins/multer/subscriptionSetup');
const { uploadToLinode } = require('../../../plugins/aws_sdk/setup');

const router = express.Router();

// Define file fields for multer based on model configuration
const fileFields = [
  { name: 'mediumIcon', maxCount: 1 },
  { name: 'squareNonAuthBkgd', maxCount: 1 },
  { name: 'squareAuthBkgd', maxCount: 1 },
  { name: 'horizNonAuthBkgd', maxCount: 1 },
  { name: 'horizAuthBkgd', maxCount: 1 }
];

// Route to render the form to add a new subscription
router.get('/renderAddForm', (req, res) => {
  try {
    const model = [
      { name: 'name', type: 'text' },
      { name: 'type', type: 'dropdown', options: ['Basic', 'Premium'] },
      { name: 'price', type: 'number' },
      { name: 'startDate', type: 'date' },
      { name: 'endDate', type: 'date' },
      { name: 'mediumIcon', type: 'file' },
      { name: 'squareNonAuthBkgd', type: 'file' },
      { name: 'squareAuthBkgd', type: 'file' },
      { name: 'horizNonAuthBkgd', type: 'file' },
      { name: 'horizAuthBkgd', type: 'file' },
      { name: 'nonAuthTitle', type: 'text' },
      { name: 'nonAuthDescription', type: 'textarea' },
      { name: 'authTitle', type: 'text' },
      { name: 'authDescription', type: 'textarea' },
      { name: 'daysSubscribed', type: 'number' },
      { name: 'gemsType', type: 'text' },
      { name: 'gemsCt', type: 'number' },
      { name: 'items', type: 'text' },  // Assuming comma-separated string for simplicity
      { name: 'vendors', type: 'text' },  // Assuming comma-separated string for simplicity
      { name: 'gameTokens', type: 'number' },
    ]; // Empty model for new subscription

    const formFields = generateFormFields(model);

    res.render('forms/generalForm', {
      title: 'Add New Subscription',
      action: '/subscriptions/create',
      formFields: formFields,
      generateFormFields: generateFormFields // Pass the function to the template
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

// Middleware to upload images to Linode
const uploadImagesToLinode = async (req, res, next) => {
  try {
    if (req.files) {
      for (const key in req.files) {
        const file = req.files[key][0];
        const fileKey = `subscriptions/${Date.now()}-${file.originalname}`;
        const url = await uploadToLinode(file.path, fileKey);
        req.body[key] = url; // Save the URL in the request body
      }
    }
    next();
  } catch (error) {
    console.error("Error in uploadImagesToLinode middleware:", error);
    next(error);
  }
};

// Route to create a subscription
router.post('/create', upload.fields(fileFields), processImages, uploadImagesToLinode, async (req, res) => {
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
    res.status(200).render('admin/subscriptions/template', { subscriptions });
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
    // Ensure the subscription exists
    const subscription = await Subscription.getById(id);
    if (!subscription) {
      return res.status(404).send({ error: 'Subscription not found' });
    }
    // Serve the HTML file
    res.sendFile(path.join(__dirname, '../html/viewer.html'));
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});


// Route to update a subscription by ID
router.put('/:id', upload.fields(fileFields), processImages, uploadImagesToLinode, async (req, res) => {
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
