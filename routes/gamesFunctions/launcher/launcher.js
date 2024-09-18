import express from 'express';
import Launcher from '../../../plugins/mongo/models/games/Launcher.js';
import generateFormFields from '../../../plugins/helpers/formHelper.js';
import { buildRoutes } from '../../helpers/routeBuilder.js';
import Game from '../../../plugins/mongo/models/games/Game.js';
import GameSession from '../../../plugins/mongo/models/games/GameSession.js';
import GameSetting from '../../../plugins/mongo/models/games/GameSetting.js';
import chalk from 'chalk';

const router = express.Router();
const modelName = 'launcher';
// Route to create a new game session for an existing game
// Route to create a new game session for an existing game
router.post('/create-session', async (req, res) => {
  try {
    const user = req.user;
    const { gameId } = req.body;

    if (!gameId) {
      return res.status(400).send({ error: 'No game selected for session creation' });
    }

    // Fetch the game by its ID
    const game = await new Game().getById(gameId);
    if (!game) {
      return res.status(404).send({ error: 'Game not found' });
    }

    // Fetch the game settings associated with the game
    
    // Create a new game session for the existing game
    const newGameSession = await new GameSession().create({
      gameId: game._id,
      gameSettings:game.gameSettings,
      gameName: game.name,
      players: [{
        id: JSON.stringify(user._id),
        displayName: user.displayName,
        lastMove: null
      }],
      status: 'waiting for players',
      currentState: {},
    });
    
    const gameSettingsData = await new GameSetting().getById(game.gameSettings);
    if (!gameSettingsData) {
      return res.status(404).send({ error: 'Game settings not found' });
    }
    // Render the cardTable layout (no redirect)
    res.render('layouts/games/cardTable', {
      gameSession: newGameSession,
      gameSettingsData: gameSettingsData,  // Pass the game settings
      user: user
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Failed to create game session' });
  }
});
router.post('/join/:sessionId', async (req, res) => {
  try {
    const user = req.user;
    const userId = user._id;
    const { sessionId } = req.params; // This is the game session ID

    // Find the game session by session ID
    const gameSession = await new GameSession().getById(sessionId);
    if (!gameSession) {
      return res.status(404).send({ error: 'Game session not found' });
    }

    // Check if the user is already part of this session
    const isPlayerInSession = gameSession.players.some(player => player.id.toString() === userId.toString());

    const gameSettingsData = await new GameSetting().getById(gameSession.gameSettings);
    if (isPlayerInSession) {
      console.log(chalk.blue.bgGray(`player in session, adding to active session...`))
      // If the user is already in the session, just render the game session
      console.log(chalk.blue(gameSettingsData))
      return res.render('layouts/games/cardTable', {
        gameSession: gameSession,
        gameSettingsData:gameSettingsData,
        user: req.user
      });
    }
const idString = JSON.stringify(userId)
    // Add the user to the session's players array
    const updatedPlayers = [...gameSession.players, {
      id: idString,
      displayName: user.displayName,
      lastMove: null
    }];

    // Update the session with the new players array
    const update = { players: updatedPlayers };
    await new GameSession().updateById(sessionId, update); // Use your model's update method

    // Get the updated game session and settings data
    const updatedSession = await new GameSession().getById(sessionId);

    // Render the game session for the user
    res.render('layouts/games/cardTable', {
      gameSession: updatedSession,
      gameSettingsData:gameSettingsData,
      user: user
    });

  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Failed to join game session' });
  }
});


router.get('/exit/:id', async (req, res) => {
  try {
    const gameSessionId = req.params.id;
    const user = req.user;
    
    // Logic to handle exit, e.g., marking user as exited or removing them from session
    await new GameSession().exitSession(user._id, gameSessionId);

    res.redirect('/getLauncher'); // Redirect back to launcher after exit
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Failed to exit game' });
  }
});
// Route to get the launcher
router.get('/getLauncher', async (req, res) => {
  try {
    // Fetch all games and game sessions
    const games = await new Game().getAll();
    const gameSessions = await new GameSession().getAll();
    const userId = req.user._id.toString();  // Convert user ID to string

    // Find a game session where the user is in the players array
    const userGameSession = gameSessions.find(session =>
      session.players.some(player => player.id.toString() === userId)  // Convert player ID to string
    );

    // Render the launcher with the user's game if found, or the full list
    res.render('layouts/games/launcher', {
      gameSessions: gameSessions,
      userGame: userGameSession, // Pass the game session where the user is a player, if found
      user: req.user,
      selectedGameId: games.length > 0 ? games[0]._id : null // Set the first game as the default
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error loading launcher');
  }
});





// Route to render the form to add a new launcher
router.get('/renderAddForm', (req, res) => {
  try {
    const model = Launcher.getModelFields();
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
      data: launcher,
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
      data: data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

buildRoutes(new Launcher(), router);

export default router;
