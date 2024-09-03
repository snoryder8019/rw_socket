import express from 'express';
import GameInterface from '../../../plugins/mongo/models/games/noDb/GameInterface.js';
import GameMech from '../../../plugins/mongo/models/games/noDb/GameMech.js';
import GameState from '../../../plugins/mongo/models/games/noDb/GameState.js';
import GameTile from '../../../plugins/mongo/models/games/noDb/GameTile.js';
import Utility from '../../../plugins/mongo/models/games/noDb/Utility.js';

const router = express.Router();

// Example route to demonstrate GameInterface usage
router.get('/game-interface/elements', (req, res) => {
  const gameInterface = new GameInterface();
  gameInterface.addElement({ id: 1, name: 'Health Bar' });
  res.json(gameInterface.getElements());
});

// Example route to demonstrate GameMech usage
router.post('/game-mech/apply-action', (req, res) => {
  const { actionName, player } = req.body;
  const gameMech = new GameMech();
  gameMech.addAction({ name: 'Attack', effect: (player) => { player.health -= 10; } });
  const result = gameMech.applyAction(actionName, player);
  res.send(result);
});

// Example route to demonstrate GameState usage
router.get('/game-state/start', (req, res) => {
  const gameState = new GameState();
  gameState.startGame();
  res.send(`Game state: ${gameState.getState()}`);
});

// Example route to demonstrate GameTile usage
router.get('/game-tile', (req, res) => {
  const gameTile = new GameTile(5, 10, 'grass');
  res.json(gameTile.getPosition());
});

// Example route to demonstrate Utility usage
router.get('/utility/random', (req, res) => {
  const randomNum = Utility.randomNumber(1, 100);
  res.json({ randomNum });
});

export default router;
