//THIS IS A GREAT EXAMPLE TO REFACTOR
const express = require('express');
const Club = require('../../../plugins/mongo/models/Club');
const { generateFormFields } = require('../../../plugins/helpers/formHelper');
const buildRoutes = require('../../helpers/routeBuilder');

const router = express.Router();
const modelName = "club";
// Route to render the form to add a new club
router.get('/renderAddForm', (req, res) => {
  try {
    const model = Club.getModelFields();
    const formFields = generateFormFields(model);
    console.log('renderAddForm');

    res.render('forms/generalForm', {
      title: 'Add New Club',
      action: '/clubs/create',
      formFields: formFields
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

// Route to render the form to edit an existing club
router.get('/renderEditForm/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const club = await new Club().getById(id);
    if (!club) {
      return res.status(404).send({ error: 'Club not found' });
    }
    const model = Club.getModelFields();
    const formFields = generateFormFields(model, club); // Generate form fields as an array

    res.render('forms/generalEditForm', {
      title: 'Edit Club',
      action: `clubs/update/${id}`,
      routeSub: 'clubs',
      method: 'post',
      formFields: formFields,
      data: club
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});
/////////////////
router.get('/section', async (req, res) => {
  try {
    const clubs = await new Club().getAll();
    res.render('admin/clubs/section', {
      title: 'Section View',
      clubs: clubs
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

buildRoutes(new Club(), router);

module.exports = router;
