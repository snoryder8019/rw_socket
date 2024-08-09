const express = require('express');
const GameRoom = require('../../../../plugins/mongo/models/games/GameRoom');
const { generateFormFields } = require('../../../../plugins/helpers/formHelper');
const buildRoutes = require('../../../helpers/routeBuilder');
const router = express.Router();
const modelName = "gameRoom";

// Route to load the Dominoes game using the cardTable layout
router.get('/getGame', async (req, res) => {
  try {
    res.json({
      title: 'Dominoes',
      gameType: 'Dominoes',
      scripts: [
        '/socket.io/socket.io.js',
        '/javascripts/games/cardTable.js',
        '/javascripts/games/dominoes.js'
      ]
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

// Route to load the game room section (if needed)
router.get('/section', async (req, res) => {
  try {
    const data = await new GameRoom().getAll();
    res.render(`./layouts/${modelName}`, {
      title: 'Game Room View',
      data: data
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

// Other CRUD routes (add/edit/delete Game Rooms) managed by buildRoutes
buildRoutes(new GameRoom(), router);

module.exports = router;
