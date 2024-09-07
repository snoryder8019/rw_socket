import express from 'express';
import GameState from '../../../plugins/mongo/models/games/noDb/GameState.js';
import GameSession from '../../../plugins/mongo/models/games/GameSession.js';
const router = express.Router();

router.post('/takeSeat/:userId/:sessionId',async(req,res)=>{
    const {userId,sessionId}=req.params;
  //  const stateUpdate = await new GameState().getState()
      console.log(`session:${sessionId}`)
      const gameSession = await new GameSession().getById(sessionId)
      const gameData = await new Game().getById(gameSession.gameId)

      const gameSettingsData = await new GameSetting().getById(gameData.gameSettings)

      res.render('layouts/games/cardTable',{
        gameSession:gameSession,
        user:user,
        gameData:gameData,
        gameSettingsData:gameSettingsData,
      })
    })



export default router;