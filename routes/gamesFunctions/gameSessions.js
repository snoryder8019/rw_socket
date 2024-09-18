//GPT DONT DELETE THIS REFERENCE LINE
//routes/gamesFunctions/gameSessions.js
//GPT DONT DELETE THIS REFERENCE LINE
import express from 'express';
import chalk from 'chalk';
import GameSession from '../../plugins/mongo/models/games/GameSession.js';
import Game from '../../plugins/mongo/models/games/Game.js';
import generateFormFields from '../../plugins/helpers/formHelper.js';
import { buildRoutes } from '../helpers/routeBuilder.js';
import GameSetting from '../../plugins/mongo/models/games/GameSetting.js';
import User from '../../plugins/mongo/models/User.js'
const router = express.Router();
const modelName = 'gameSession';

// Route to render the form to add a new game session
router.get('/renderAddForm', (req, res) => {
  try {
    const model = GameSession.getModelFields();
    const formFields = generateFormFields(model);
    console.log('renderAddForm');

    res.render('forms/generalForm', {
      title: `Add New ${modelName}`,
      action: `/${modelName}s/create`,
      formFields: formFields,
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
      data: gameSession,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});
const renderGameSession = async (gameSession, user, res) => {
  const gameData = await new Game().getById(gameSession.gameId);
  const gameSettingsData = await new GameSetting().getById(gameData.gameSettings);
  
  res.render('layouts/games/cardTable', {
    gameSession: gameSession,
    user: user,
    gameData: gameData,
    gameSettingsData: gameSettingsData,
  });
};

// Function to handle rejoining an existing session
const reJoinSession = async (sessionId, req, res) => {
  console.log(chalk.blue(`Rejoining session: ${sessionId}`));
  
  const gameSession = await new GameSession().getById(sessionId);
  await renderGameSession(gameSession, req.user, res);
};

// Route to join a new game session
router.post('/join/:gameId', async (req, res) => {
  try {
    const user = req.user;
    const userId = JSON.stringify(user._id);
    const { gameId } = req.params;
    
    // Check if the user is already in a session
    const userCheck = await new GameSession().checkForUser(userId);
    if (userCheck) {
      return reJoinSession(userCheck, req, res);
    }

    // Create new game session setup
    const game = await new Game().getById(gameId);
    const gameSetup = {
      gameId: game._id,
      gameName: game.name,
      gameSettings: game.gameSettings,
      gameRuleSet: game.ruleSet,
      players: [{
        id: userId,
        displayName: user.displayName,
        lastMove: null
      }],
      startTime: new Date(),
      endTime: null,
      currentState: "waiting to start",
      turnHistory: [],
      status: "waiting for players",
    };

    // Create the new session
    const gameSession = await new GameSession().create(gameSetup);
    await new GameSession().markUserLast(userId, gameSession._id);

    // Render the new session
    await renderGameSession(gameSession, user, res);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal server error');
  }
});

// Route to join an existing session
router.post('/joinSession/:gameId', async (req, res) => {
  try {
    const user = req.user;
    const sessionId = req.params.gameId;
    
    // Check if user is already in a session
    const userCheck = await new GameSession().checkForUser(user._id);
    if (userCheck) {
      console.log('User already in a session, rejoining...');
      return reJoinSession(userCheck, req, res);
    }

    // Add user to the session if not already part of it
    const player = {
      id: JSON.stringify(user._id),
      displayName: user.displayName,
      lastMove: null
    };
    
    await new GameSession().pushById(sessionId, { players: player });
    await new User().updateById(user._id, { lastGame: sessionId });
    
    // Get updated session details and render
    const gameSession = await new GameSession().getById(sessionId);
    await renderGameSession(gameSession, user, res);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal server error');
  }
});
// Route to load game sessions
router.get('/section', async (req, res) => {
  try {
    const data = await new GameSession().getAll();
    res.render(`./layouts/${modelName}`, {
      title: 'Game Session View',
      data: data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

buildRoutes(new GameSession(), router);

export default router;
