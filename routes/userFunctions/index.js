import express from 'express';
import userShareCodes from './userShareCodes/userShareCodes.js';
import chat from './chat/chat.js';
import avatars from './avatars/avatars.js';
import userImages from './userImages/userImages.js';
import help from './help/help.js';
import reader from './reader/reader.js';
const router = express.Router();
router.use('/userShareCodes', userShareCodes);
router.use('/chat', chat);
router.use('/avatars', avatars);
router.use('/userImages', userImages);

router.use('/help', help);
router.use('/reader', reader);
export default router;
