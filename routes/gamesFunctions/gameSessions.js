//routes/gamesFunctions/gameSessions.js
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
const reJoinSession =  async (sessionId,req,res)=>{
  console.log(chalk.blue(sessionId))
  const gameSession = await new GameSession().getById(sessionId)
const user =req.user
  const gameData = await new Game().getById(gameSession.gameId)
  const gameSettingsData = await new GameSetting().getById(gameData.gameSettings)
  res.render('layouts/games/cardTable',{
    gameSession:gameSession,
    user:user,
    gameData:gameData,
    gameSettingsData:gameSettingsData,
  })
}
router.post('/joinSession/:gameId', async(req,res)=>{
  try{
    const user = req.user;
    const sessionId=req.params.gameId;
    const userCheck = await new GameSession().checkForUser(user._id)
    if (userCheck) {
      // If the user is already part of a session, call reJoinSession with the correct sessionId
      console.log('User already in a session, rejoining...');
      return await reJoinSession(userCheck, req, res); // Ensure userCheck is the sessionId
    } else {
      console.log('No existing session, creating a new one...');
      // Create a new session or handle the logic here
    }
    console.log(`userCheck:${userCheck}`) 
    const player={
      players:{
      id:user._id,
      displayName:user.displayName,
      lastMove:null},
    }
    const sessionUpdate = await new GameSession().pushById(sessionId,player)
    const gameSession = await new GameSession().getById(sessionId)
    const result =  await new User().updateById(user._id,{lastGame:gameSession._id.toString()});
    const gameData = await new Game().getById(gameSession.gameId)
const gameSettingsData = await new GameSetting().getById(gameData.gameSettings)


res.render('layouts/games/cardTable',{
  gameSession:gameSession,
  user:user,
  gameData:gameData,
  gameSettingsData:gameSettingsData,
})

  }
  catch(error){console.error(error)}
})
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
