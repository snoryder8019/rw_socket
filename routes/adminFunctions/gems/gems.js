const express = require('express');
const Gem = require('../../../plugins/mongo/models/Gem');
const { generateFormFields } = require('../../../plugins/helpers/formHelper');
const buildRoutes = require('../../helpers/routeBuilder');

const router = express.Router();
const modelName = "gem";
// Route to render the form to add a new gem
router.get('/renderAddForm', (req, res) => {
  try {
    const model = Gem.getModelFields();
    const formFields = generateFormFields(model);
    console.log('renderAddForm');

    res.render('forms/generalForm', {
      title: 'Add New gem',
      action: '/gems/create',
      formFields: formFields
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

// Route to render the form to edit an existing gem
router.get('/renderEditForm/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const gem = await new Gem().getById(id);
    if (!gem) {
      return res.status(404).send({ error: 'Gem not found' });
    }
    const model = Gem.getModelFields();
    const formFields = generateFormFields(model, gem); // Generate form fields as an array

    res.render('forms/generalEditForm', {
      title: 'Edit Gem',
      action: `gems/update/${id}`,
      routeSub: 'gems',
      method: 'post',
      formFields: formFields,
      data: gem
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});
/////////////////
router.get('/section', async (req, res) => {
  try {
    const data = await new Gem().getAll();
    res.render('./layouts/section', {
      title: 'Section View',
      data: data
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

buildRoutes(new Gem(), router);

module.exports = router;
