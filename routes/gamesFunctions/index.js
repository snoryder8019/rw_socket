import express from 'express';
import launcherRouter from './launcher/launcher.js';
import playerRouter from './player/playerCard.js';
import logsRouter from './logs/gameLogs.js';

const router = express.Router();

router.use('/launcher', launcherRouter);
router.use('/player', playerRouter);
router.use('/logs', logsRouter);

export default router;
