const express = require('express');
const GameSession = require('../../../plugins/mongo/models/GameSession');
const { generateFormFields } = require('../../../plugins/helpers/formHelper');
const buildRoutes = require('../../helpers/routeBuilder');

const router = express.Router();
const modelName = "gameSession";

// Route to render the form to add a new game session
router.get('/renderAddForm', (req, res) => {
  try {
    const model = GameSession.getModelFields();
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

// Route to render the form to edit an existing game session
router.get('/renderEditForm/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const gameSession = await new GameSession().getById(id);
    if (!gameSession) {
      return res.status(404).send({ error: 'Game session not found' });
    }
    const model = GameSession.getModelFields();
    const formFields = generateFormFields(model, gameSession); // Generate form fields as an array
    res.render('forms/generalEditForm', {
      title: `Edit ${modelName}`,
      action: `${modelName}s/update/${id}`,
      routeSub: `${modelName}s`,
      method: 'post',
      formFields: formFields,
      data: gameSession
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

// Route to load game sessions
router.get('/section', async (req, res) => {
  try {
    const data = await new GameSession().getAll();
    res.render(`./layouts/${modelName}`, {
      title: 'Game Session View',
      data: data
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

buildRoutes(new GameSession(), router);

module.exports = router;
