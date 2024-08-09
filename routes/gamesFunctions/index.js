const express = require('express')
const router = express.Router();

const launcherRouter = require('./launcher/launcher')
router.use('/',launcherRouter)
const playerRouter = require('./player/playerCard')
router.use('/',playerRouter)
const logsRouter = require('./logs/gameLogs');
router.use('/',logsRouter)



module.exports=router;
