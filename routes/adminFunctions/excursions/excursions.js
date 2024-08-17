const express = require('express');
const Excursion = require('../../../plugins/mongo/models/travel/Excursion');
const { generateFormFields } = require('../../../plugins/helpers/formHelper');
const buildRoutes = require('../../helpers/routeBuilder');

const router = express.Router();
const modelName = "excursion";
// Route to render the form to add a new excursion
router.get('/renderAddForm', (req, res) => {
  try {
    const model = Excursion.getModelFields();
    const formFields = generateFormFields(model);
    console.log('renderAddForm');

    res.render('forms/generalForm', {
      title: 'Add New Excursion',
      action: '/excursions/create',
      formFields: formFields
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

// Route to render the form to edit an existing excursion
router.get('/renderEditForm/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const excursion = await new Excursion().getById(id);
    if (!excursion) {
      return res.status(404).send({ error: 'Excursion not found' });
    }
    const model = Excursion.getModelFields();
    const formFields = generateFormFields(model, excursion); // Generate form fields as an array

    res.render('forms/generalEditForm', {
      title: 'Edit Excursion',
      action: `excursions/update/${id}`,
      routeSub: 'excursions',
      method: 'post',
      formFields: formFields,
      data: excursion
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});
/////////////////
router.get('/section', async (req, res) => {
  try {
    const data = await new Excursion().getAll();
    res.render('./layouts/section', {
      title: 'Section View',
      data: data
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

buildRoutes(new Excursion(), router);

module.exports = router;
