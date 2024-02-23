var express = require('express');
var router = express.Router();
const pluginsRouter = require('../plugins')
router.use(pluginsRouter);
const flash = require('express-flash');
const { getDb } = require('../plugins/mongo/mongo');
const path = require('path');
const fs = require('fs');
const os = require('os')
const upload = require('../plugins/multer/setup')
const {isAdmin} = require('./adminFunctions/adminFunctions')
//THIS IS AN ADMIN PANEL REQUIRING A DB TAG OF isAdmin == "true"
const {readLogFile, gatherIp} = require('../routes/systemFunctions/systemFunctions')

router.get('/',gatherIp, isAdmin, async (req, res) => {
  let user = req.user;
  
  const db = getDb();

  const collection= db.collection('users')
  const users = await collection.find({}).toArray()
  
  const collection2= db.collection('tickets')
  const tickets = await collection2.find({}).toArray()
  //console.log(users)
const logs = {}
const thisPath = path.join(__dirname,'../logs')
logs.passReset = await readLogFile(`${thisPath}/passReset.json`)
const pRParsed = JSON.parse(logs.passReset)
logs.passReset = pRParsed
logs.errors = await readLogFile(`${thisPath}/errors.json`)
const eRParsed = JSON.parse(logs.errors)
logs.errors = eRParsed
console.log(logs)
const system = {
  totalmem: os.totalmem(),
  freemem: os.freemem(),
  cpus: os.cpus().length, // Number of CPUs
  uptime: os.uptime() // System uptime in seconds
};
  res.render('admin', { 
      user: user, 
      message: req.flash(),
      users:users,
      tickets:tickets,
      logs:logs,
      system:system
  });
});

module.exports = router;
