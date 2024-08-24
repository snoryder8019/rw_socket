const express = require('express');
const router = express.Router();
const chat = require('./chat/chat')
router.use('/chat', chat)
const help = require('./help/help')
router.use('/help', help)
module.exports = router