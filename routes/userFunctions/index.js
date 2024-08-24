import express from 'express';
import chat from './chat/chat.js';
import help from './help/help.js';

const router = express.Router();
router.use('/chat', chat);
router.use('/help', help);
export default router;
