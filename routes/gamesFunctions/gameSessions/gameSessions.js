// routes/gamesFunctions/gamesSessions/gameSessions.js

const express = require('express');
const GameSession = require('../../../plugins/mongo/models/games/GameSession');
const { generateFormFields } = require('../../../plugins/helpers/formHelper');
const buildRoutes = require('../../helpers/routeBuilder');
const { ObjectId } = require('mongodb');
const GameRoom = require('../../../plugins/mongo/models/games/GameRoom');
const Launcher = require('../../../plugins/mongo/models/games/Launcher');
const { getDb } = require('../../../plugins/mongo/mongo');

const router = express.Router();
const modelName = "gameSession";
// routes/gamesFunctions/gamesSessions/gameSessions.js

router.get('/join/:sessionId', async (req, res) => {

  const sessionId = req.params.sessionId;
  const userId = req.user._id.toString(); // Convert ObjectId to string
  const displayName = req.user.firstName;

  // Find the avatar URL where user.image.avatar == true
  const avatarUrl = req.user.images && req.user.images.find(image => image.avatar === true)?.url;

  try {
    // Retrieve or create a game session
    const session = await GameSession.getGameSession(sessionId, userId);

    // Check if the user is already in the session
    const playerExists = session.players.some(player => player.id === userId);
    if (playerExists) {
      console.log(`User ${userId} is already in session ${session._id}`);
    } else {
      // Add the player to the session
      const playerData = { id: userId, ready: false, displayName, avatarUrl };
      session.players.push(playerData);

      // Save the updated session using an update query
      const db = getDb();
      await db.collection('gameSessions').updateOne(
        { _id: session._id }, 
        { $set: { players: session.players } }
      );

      console.log(`User ${userId} added to session ${session._id}`);
    }

    // Render the game menu with session, game, and user details
    res.render('layouts/games/gameMenu', {
      user: req.user,
      session: session
    });
  } catch (error) {
    console.error('Error joining game session:', error);
    res.status(500).send('An error occurred while trying to join the game session.');
  }
  return; // routes/gamesFunctions/gamesSessions/gameSessions.js
});

router.get('/ready/:sessionId', async (req, res) => {
  const sessionId = req.params.sessionId;
  const userId = req.user._id;

  try {
      // Call the readyUp function to mark the user as ready
      const { success, message, session } = await GameSession.readyUp(sessionId, userId);

      if (!success) {
          return res.status(404).send(message); // Return 404 if the player was not found or there was an issue
      }

      // Render the game menu with the updated session and user details
      res.render('layouts/games/gameMenu', {
          user: req.user,
          session: session,
          game: session.game // Ensure game details are also passed to the view
      });
  } catch (error) {
      console.error('Error updating game session:', error);
      res.status(500).send('An error occurred while trying to update the game session.');
  }
  return; // routes/gamesFunctions/gamesSessions/gameSessions.js
});
// routes/gamesFunctions/gamesSessions/gameSessions.js

router.get('/exit/:sessionId', async (req, res) => {
  const sessionId = req.params.sessionId;
  const userId = req.user._id.toString(); // Convert ObjectId to string
  const seshId = new ObjectId(sessionId);

  try {
    // Attempt to remove the user from the session
    const sessionExit = await GameSession.leaveSession(seshId, userId);

    // Fetch necessary data for the launcher
    const data = await new Launcher().getAll();
    const data2 = await new GameRoom().getAll();
    const data3 = await new GameSession().getAll();
    
    // Determine if the user is currently in any other game session
    let inGame = false;

    data3.forEach((session, index) => {
      if (session.players.some(player => player.id === userId)) {
        inGame = {
          id: session._id,
          gameNo: index + 1, // Using the index in the return order
          gameType: session.gameName
        };
      }
    });

    // Render the launcher view with updated data
    res.render('layouts/games/launcher', {
      title: 'Game Launcher',
      launchers: data,
      gameRooms: data2,
      gameSessions: data3,
      inGame: inGame // Pass the session details or false
    });
  } catch (error) {
    console.error('Error exiting game session:', error);
    res.status(500).send('An error occurred while trying to exit the game session.');
  }
  return; // routes/gamesFunctions/gamesSessions/gameSessions.js
});


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
    const gameSession = new GameSession();
    const data = await gameSession.getAll();
    res.render(`./layouts/${modelName}`, {
      title: 'Game Session View',
      data: data
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

// Route to get game sessions and related data to render the launcher view

// Route to render the game menu view after joining a session
router.get('/getGameSession', async (req, res) => {
  try {
    const { userId, gameRoomId } = req.query; // Assuming userId and gameRoomId are passed as query parameters

    // Get or create a game session
    const sessionToJoin = await GameSession.getGameSession(gameRoomId, userId);

    // Render the game menu view with session data
    res.render(sessionToJoin.pathForGameMenuView(), {
      title: 'Game Menu',
      userId: userId,
      gameRoomId: gameRoomId,
      gameSession: sessionToJoin // Pass the session data to the view
    });

  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

buildRoutes(new GameSession(), router);

module.exports = router;
