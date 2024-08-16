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
  submitTicket,
  saveRotation,
  assignAvatar,
  deleteAvatar,
} from './userFunctions/userFunctions.js';
import { updateBanned } from './securityFunctions/updateBanned.js';
import userBucketRouter from './userFunctions/userBucketFunctions.js';
import { getNotifications } from './userFunctions/userNotifications.js';
import gamesRouter from './gamesFunctions/index.js';

const router = express.Router();
// Middleware to use cookieParser
router.use(cookieParser());

router.use(pluginsRouter);
router.use('/', adminFunctionsRouter);
router.use('/', cookiesRouter);
router.use(userBucketRouter);
router.use('/games', gamesRouter);

router.get('/getNotifications', getNotifications);
router.post('/deleteAvatar', deleteAvatar);
router.post('/assignAvatar', assignAvatar);

router.post('/submitTicket', submitTicket);
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
    const webappSettings = await collection.find().toArray();
    const sectionSettings = await collection1.find().toArray();
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
