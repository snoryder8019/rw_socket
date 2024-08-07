const express = require('express');
const Achievement = require('../../../plugins/mongo/models/games/Achievement');
const { generateFormFields } = require('../../../plugins/helpers/formHelper');
const buildRoutes = require('../../helpers/routeBuilder');

const router = express.Router();
const modelName = "achievement";

// Route to render the form to add a new achievement
router.get('/renderAddForm', (req, res) => {
  try {
    const model = Achievement.getModelFields();
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

// Route to render the form to edit an existing achievement
router.get('/renderEditForm/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const achievement = await new Achievement().getById(id);
    if (!achievement) {
      return res.status(404).send({ error: 'Achievement not found' });
    }
    const model = Achievement.getModelFields();
    const formFields = generateFormFields(model, achievement); // Generate form fields as an array
    res.render('forms/generalEditForm', {
      title: `Edit ${modelName}`,
      action: `${modelName}s/update/${id}`,
      routeSub: `${modelName}s`,
      method: 'post',
      formFields: formFields,
      data: achievement
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

// Route to load achievements
router.get('/section', async (req, res) => {
  try {
    const data = await new Achievement().getAll();
    res.render(`./layouts/${modelName}`, {
      title: 'Achievement View',
      data: data
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

buildRoutes(new Achievement(), router);

module.exports = router;
