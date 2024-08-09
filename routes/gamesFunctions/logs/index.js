const express = require('express');
const router = express.Router();
 

const acheivements = require('./achievements')
const gameLogs = require('./gameLogs')
const scoreLogs = require('./scoreLogs');

router.use('/acheivments',acheivements)
router.use('/gameLogs',gameLogs)
router.use('/scoreLogs',scoreLogs)

module.exports =router 