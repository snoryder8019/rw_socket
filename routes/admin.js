import express from 'express';
import pluginsRouter from '../plugins/index.js';
import { getDb } from '../plugins/mongo/mongo.js';
import path from 'path';
import os from 'os';
import { isAdmin } from './adminFunctions/adminFunctions.js';
import { readLogFile, gatherIp } from './systemFunctions/systemFunctions.js';

const router = express.Router();

router.use(pluginsRouter);
router.get('/', gatherIp, isAdmin, async (req, res) => {
  let user = req.user;

  const db = getDb();

  const collection = db.collection('users');
  const users = await collection.find({}).toArray();

  const collection2 = db.collection('tickets');
  const tickets = await collection2.find({}).toArray();
  //console.log(users)
  const logs = {};
  const thisPath = path.join(__dirname, '../logs');
  logs.passReset = await readLogFile(`${thisPath}/passReset.json`);
  const pRParsed = JSON.parse(logs.passReset);
  logs.passReset = pRParsed;
  logs.errors = await readLogFile(`${thisPath}/errors.json`);
  const eRParsed = JSON.parse(logs.errors);
  logs.errors = eRParsed;
  console.log(logs);
  const system = {
    totalmem: os.totalmem(),
    freemem: os.freemem(),
    cpus: os.cpus().length, // Number of CPUs
    uptime: os.uptime(), // System uptime in seconds
  };
  res.render('admin', {
    user: user,
    message: req.flash(),
    users: users,
    tickets: tickets,
    logs: logs,
    system: system,
  });
});

export default router;
