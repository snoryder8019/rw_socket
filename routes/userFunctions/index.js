const express = require('express');
const router = express.Router();
const chat = require('./chat/chat')
router.use('/chat', chat)
module.exports = router