const express = require('express')
const router = express.Router();

const launcherRouter = require('./launcher/launcher')
router.use('/launcher',launcherRouter)
const playerRouter = require('./player/playerCard')
router.use('/player',playerRouter)
const logsRouter = require('./logs/gameLogs');
router.use('/logs',logsRouter)



module.exports=router;
