import express from 'express';
import cookieParser from 'cookie-parser';
import pluginsRouter from '../plugins/index.js';
import cookiesRouter from './userFunctions/cookies.js';
import adminFunctionsRouter from './adminFunctions/index.js';
import { getDb } from '../plugins/mongo/mongo.js';
import noNos from './securityFunctions/forbiddens.js';
import {
  resetPasswordRequest,
  resetPassword,
  handleResetPasswordGet,
} from '../plugins/passport/passwordReset.js';
import {
  userDataUpload,
  saveRotation,
  assignAvatar,
  deleteAvatar,
} from './userFunctions/userFunctions.js';
import { updateBanned } from './securityFunctions/updateBanned.js';
import userBucketRouter from './userFunctions/userBucketFunctions.js';
import { getNotifications } from './userFunctions/userNotifications.js';
import gamesRouter from './gamesFunctions/index.js';
import users from './userFunctions/index.js';
import Footer from '../plugins/mongo/models/footer/Footer.js';
import Marquee from '../plugins/mongo/models/Marquee.js';

const router = express.Router();
// Middleware to use cookieParser
router.use(cookieParser());

router.use(pluginsRouter);
router.use('/', adminFunctionsRouter);
router.use('/users', users);
router.use('/', cookiesRouter);
router.use(userBucketRouter);
router.use('/games', gamesRouter);

router.get('/getNotifications', getNotifications);
router.post('/deleteAvatar', deleteAvatar);
router.post('/assignAvatar', assignAvatar);

router.post('/reset-password-request', resetPasswordRequest);
router.post('/passwordReset/:token', resetPassword);
router.get('/reset-password/:token', handleResetPasswordGet);

router.post('/updateBanned', updateBanned);
router.post('/userDataUpload', userDataUpload);
router.post('/saveRotation', saveRotation);
router.get('/', noNos, async (req, res) => {
  let user = req.user;

  const db = getDb();
  const collection = db.collection('webappSettings');
  const collection1 = db.collection('sectionSettings');
  const collection2 = db.collection('chat_rooms_meta');
  const collection3 = db.collection('videos');
  const collection4 = db.collection('p2p_rooms');

  try {
    const footer = await new Footer().getAll();
    const marquee = await new Marquee().getAll();
    const webappSettings = await collection.find().toArray();
    
    // Fetch and sort sectionSettings by `order`, placing undefined or 0 last
    const sectionSettings = await collection1.find().toArray();
    sectionSettings.sort((a, b) => {
      if (!a.order || a.order === 0) return 1; // Place undefined or 0 values last
      if (!b.order || b.order === 0) return -1;
      return a.order - b.order; // Ascending order
    });

    const chatRooms = await collection2.find().toArray();
    const videos = await collection3.find().toArray();
    const p2p_rooms = await collection4.find().toArray();
    const cookieData = {
      lastVisit: req.cookies.lastVisit,
      userName: req.cookies.userName,
      visitCount: parseInt(req.cookies.visitCount),
    };
    console.log(cookieData);

    res.render('index', {
      user: user,
      footer: footer,
      marquee: marquee,
      cookieData: cookieData,
      webappSettings: webappSettings,
      sectionSettings: sectionSettings,
      chatRooms: chatRooms,
      rooms: p2p_rooms,
      videos: videos,
      message: req.flash(),
    });
  } catch (error) {
    console.error(error);
    res.send(`error: ${error}`);
  }
});

export default router;
