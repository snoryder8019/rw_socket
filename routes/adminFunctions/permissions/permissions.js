const express = require('express');
const router = express.Router();
const path = require('path')
const upload = require('../../../plugins/multer/setup');
const { getDb } = require('../../../plugins/mongo/mongo');
const { ObjectId } = require('mongodb');
const config = require('../../../config/config'); // Import config if you're using it
const lib = require('../../logFunctions/logFunctions')
const fs = require('fs')

module.exports = router;
