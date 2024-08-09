const express = require('express');
const Subscription = require('../../../plugins/mongo/models/Subscription');
const { generateFormFields } = require('../../../plugins/helpers/formHelper');
const buildRoutes = require('../../helpers/routeBuilder');

const router = express.Router();
const modelName = "subscription";

// Route to render the form to add a new subscription
router.get('/renderAddForm', (req, res) => {
  try {
    const model = Subscription.getModelFields();
    const formFields = generateFormFields(model);
    console.log('renderAddForm');

    res.render('forms/generalForm', {
      title: `Add New ${modelName}`,
      action: `/${modelName}s/create`,
      formFields: formFields
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
      data: subscription
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
      data: data
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
      data: data
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

buildRoutes(new Subscription(), router);

module.exports = router;
