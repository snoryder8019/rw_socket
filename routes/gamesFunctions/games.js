const express = require('express');
const Game = require('../../../plugins/mongo/models/Game');
const { generateFormFields } = require('../../../plugins/helpers/formHelper');
const buildRoutes = require('../../helpers/routeBuilder');

const router = express.Router();
const modelName = "game";

// Route to render the form to add a new game
router.get('/renderAddForm', (req, res) => {
  try {
    const model = Game.getModelFields();
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

// Route to render the form to edit an existing game
router.get('/renderEditForm/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const game = await new Game().getById(id);
    if (!game) {
      return res.status(404).send({ error: 'Game not found' });
    }
    const model = Game.getModelFields();
    const formFields = generateFormFields(model, game); // Generate form fields as an array
    res.render('forms/generalEditForm', {
      title: `Edit ${modelName}`,
      action: `${modelName}s/update/${id}`,
      routeSub: `${modelName}s`,
      method: 'post',
      formFields: formFields,
      data: game
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

// Route to load games
router.get('/section', async (req, res) => {
  try {
    const data = await new Game().getAll();
    res.render(`./layouts/${modelName}`, {
      title: 'Game View',
      data: data
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

buildRoutes(new Game(), router);

module.exports = router;
