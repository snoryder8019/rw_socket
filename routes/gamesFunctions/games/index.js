const express = require('express');
const router = express.Router();

const dominoesRouter = require('./dominoes/dominoes')
router.use('/dominoes', dominoesRouter)

module.exports = router
