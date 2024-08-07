const express = require('express');
const Notification = require('../../../plugins/mongo/models/notifications/Notification');
const { generateFormFields } = require('../../../plugins/helpers/formHelper');
const buildRoutes = require('../../helpers/routeBuilder');

const router = express.Router();
const modelName = "notification";

// Route to render the form to add a new notification
router.get('/renderAddForm', (req, res) => {
  try {
    const model = Notification.getModelFields();
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

// Route to render the form to edit an existing notification
router.get('/renderEditForm/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await new Notification().getById(id);
    if (!notification) {
      return res.status(404).send({ error: 'Notification not found' });
    }
    const model = Notification.getModelFields();
    const formFields = generateFormFields(model, notification); // Generate form fields as an array
    res.render('forms/generalEditForm', {
      title: `Edit ${modelName}`,
      action: `${modelName}s/update/${id}`,
      routeSub: `${modelName}s`,
      method: 'post',
      formFields: formFields,
      data: notification
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

// Route to load notifications
router.get('/section', async (req, res) => {
  try {
    const data = await new Notification().getAll();
    res.render(`./layouts/${modelName}`, {
      title: 'Notification View',
      data: data
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

buildRoutes(new Notification(), router);

module.exports = router;
