const express = require('express')
const router = express.Router()

const cronjobs = require('./cronjobs/cronjobs')
router.use('/cronjobs',cronjobs)
   module.exports=router