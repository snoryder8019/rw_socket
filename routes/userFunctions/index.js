import express from 'express';
import chat from './chat/chat.js';
import help from './help/help.js';
import reader from './reader/reader.js';

const router = express.Router();
router.use('/chat', chat);
router.use('/help', help);
router.use('/reader', reader);
export default router;
