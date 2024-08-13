const express = require('express');
const Launcher = require('../../../plugins/mongo/models/games/Launcher');
const { generateFormFields } = require('../../../plugins/helpers/formHelper');
const buildRoutes = require('../../helpers/routeBuilder');
const GameRoom = require('../../../plugins/mongo/models/games/GameRoom');
const GameSession = require('../../../plugins/mongo/models/games/GameSession');

const router = express.Router();
const modelName = "launcher";

// Route to render the form to add a new launcher
router.get('/renderAddForm', (req, res) => {
  try {
    const model = Launcher.getModelFields();
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

// Route to render the form to edit an existing launcher
router.get('/renderEditForm/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const launcher = await new Launcher().getById(id);
    if (!launcher) {
      return res.status(404).send({ error: 'Launcher not found' });
    }
    const model = Launcher.getModelFields();
    const formFields = generateFormFields(model, launcher); // Generate form fields as an array
    res.render('forms/generalEditForm', {
      title: `Edit ${modelName}`,
      action: `${modelName}s/update/${id}`,
      routeSub: `${modelName}s`,
      method: 'post',
      formFields: formFields,
      data: launcher
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

// Route to load launchers
router.get('/section', async (req, res) => {
  try {
    const data = await new Launcher().getAll();
    res.render(`./layouts/${modelName}`, {
      title: 'Launcher View',
      data: data
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

// Entry point to the launcher
router.get('/getLauncher', async (req, res) => {
  try {
    // Fetch necessary data
    const data = await new Launcher().getAll();
    const data2 = await new GameRoom().getAll();
    const data3 = await new GameSession().getAll();
    
    // Determine if the user is currently in a game session
    const userId = req.user._id; // Assuming req.user contains the logged-in user's information
    let inGame = false;

    // Iterate through gameSessions to check if the user is in any session
    data3.forEach((session, index) => {
      if (session.playerIds.some(playerId => playerId.equals(userId))) {
        inGame = {
          id: session._id,
          gameNo: index +1, // Using the index in the return order
          gameType: session.gameName
        };
      }
    });

    // Render the launcher page
    res.render(`./layouts/games/launcher`, {
      title: 'Game Launcher',
      launchers: data,
      gameRooms: data2,
      gameSessions: data3,
      inGame: inGame // Pass the session details or false
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

buildRoutes(new Launcher(), router);

module.exports = router;
