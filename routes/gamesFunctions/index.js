const express = require('express')
const router = express.Router();

const launcherRouter = require('./launcher/launcher')
router.use('/launcher',launcherRouter)
const playerRouter = require('./player/playerCard')
router.use('/player',playerRouter)
const logsRouter = require('./logs/gameLogs');
router.use('/logs',logsRouter)
const gameRoomsRouter = require('./gameRooms/gameRooms');
router.use('/gameRooms',gameRoomsRouter)
const gameSessionsRouter = require('./gameSessions/gameSessions');
router.use('/gameSessions',gameSessionsRouter)
const gamesRouter = require('./games/');
router.use('/games',gamesRouter)




module.exports=router;
