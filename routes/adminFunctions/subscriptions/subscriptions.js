import express from 'express';
import Subscription from '../../../plugins/mongo/models/Subscription.js';
import Users from '../../../plugins/mongo/models/User.js'
import generateFormFields from '../../../plugins/helpers/formHelper.js';
import { buildRoutes } from '../../helpers/routeBuilder.js';

const router = express.Router();
const modelName = 'subscription';

// Route to render the form to add a new subscription
router.get('/renderAddForm', (req, res) => {
  try {
    const model = Subscription.getModelFields();
    const formFields = generateFormFields(model);
    console.log('renderAddForm');

    res.render('forms/generalForm', {
      title: `Add New ${modelName}`,
      action: `/${modelName}s/create`,
      formFields: formFields,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

// Route to render the form to edit an existing subscription
router.get('/renderEditForm/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const subscription = await new Subscription().getById(id);
    if (!subscription) {
      return res.status(404).send({ error: 'Subscription not found' });
    }
    const model = Subscription.getModelFields();
    const formFields = generateFormFields(model, subscription); // Generate form fields as an array
    res.render('forms/generalEditForm', {
      title: `Edit ${modelName}`,
      action: `${modelName}s/update/${id}`,
      routeSub: `${modelName}s`,
      method: 'post',
      formFields: formFields,
      data: subscription,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

// Route to load subscriptions
router.get('/section', async (req, res) => {
  try {
    const data = await new Subscription().getAll();
    res.render(`./layouts/section`, {
      title: 'Subscription View',
      data: data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});
router.get('/sectionSlide', async (req, res) => {
  try {
    const data = await new Subscription().getAll();
    res.render(`./layouts/sectionSlide`, {
      title: 'Subscription View',
      data: data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});
router.post('/assignSub', async (req, res) => {
  try {
    const { userId, subscriptionType } = req.body;

    // Directly pass the new subscription data to update the user's subscriptions field
    const updatedData = { subscription: subscriptionType };
    const result = await new Users().updateById(userId, updatedData);

    // Check if the update was successful
    if (!result || result.modifiedCount === 0) {
      return res.status(500).json({ success: false, message: 'Failed to assign subscription or no changes detected' });
    }

    res.status(200).json({ success: true, message: 'Subscription assigned successfully' });
  } catch (error) {
    console.error('Error assigning subscription:', error);
    res.status(500).json({ success: false, message: 'Failed to assign subscription' });
  }
});



buildRoutes(new Subscription(), router);

export default router;
