import express from 'express';
const router = express.Router();
import launcherRouter from './launcher/launcher.js';
import playerRouter from './player/playerUser.js';
import logsRouter from './logs/gameLogs.js';
import gameSettingsRouter from './gameSettings/gameSettings.js'
import gamesRouter from './games/games.js';
import noDbRouter from './noDb/modelRoute.js';
import gameSpritesRouter from './gameSprites/gameSprites.js';

router.use('/launcher', launcherRouter);
router.use('/player', playerRouter);
router.use('/logs', logsRouter);
router.use('/gameSettings', gameSettingsRouter);
router.use('/games', gamesRouter);
router.use('/noDb', noDbRouter);
router.use('/gameSprites', gameSpritesRouter);
router.use('/logs', logsRouter);
router.use('/logs', logsRouter);
router.use('/logs', logsRouter);
router.use('/logs', logsRouter);

export default router;
