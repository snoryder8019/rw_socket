const express = require('express');
const Travel = require('../../../plugins/mongo/models/Travel');
const { generateFormFields } = require('../../../plugins/helpers/formHelper');
const buildRoutes = require('../../helpers/routeBuilder');

const router = express.Router();
const modelName = "travel";
// Route to render the form to add a new travel
router.get('/renderAddForm', (req, res) => {
  try {
    const model = Travel.getModelFields();
    const formFields = generateFormFields(model);
    console.log('renderAddForm');

    res.render('forms/generalForm', {
      title: 'Add New Travel',
      action: '/travels/create',
      formFields: formFields
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

// Route to render the form to edit an existing travel
router.get('/renderEditForm/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const travel = await new Travel().getById(id);
    if (!travel) {
      return res.status(404).send({ error: 'Travel not found' });
    }
    const model = Travel.getModelFields();
    const formFields = generateFormFields(model, travel); // Generate form fields as an array

    res.render('forms/generalEditForm', {
      title: 'Edit Travel',
      action: `travels/update/${id}`,
      routeSub: 'travels',
      method: 'post',
      formFields: formFields,
      data: travel
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});
/////////////////
router.get('/section', async (req, res) => {
  try {
    const data = await new Travel().getAll();
    res.render('./layouts/section', {
      title: 'Section View',
      data: data
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

buildRoutes(new Travel(), router);

module.exports = router;
