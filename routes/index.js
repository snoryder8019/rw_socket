import express from 'express';
import chalk from 'chalk';
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
import Avatar from '../plugins/mongo/models/Avatar.js';
import Notify from '../plugins/mongo/models/notifications/Notify.js';
import Notification from '../plugins/mongo/models/notifications/Notification.js';

const router = express.Router();
// Middleware to use cookieParser
router.use(cookieParser());

router.use(pluginsRouter);
// focus test below:
router.use('/', adminFunctionsRouter);
// focus test below:
router.use('/users', users);
// focus test below:
router.use('/', cookiesRouter);
router.use(userBucketRouter);
router.use('/games', gamesRouter);
// ignore these
router.get('/getNotifications', getNotifications);
router.post('/deleteAvatar', deleteAvatar);
router.post('/assignAvatar', assignAvatar);

router.post('/reset-password-request', resetPasswordRequest);
router.post('/passwordReset/:token', resetPassword);
router.get('/reset-password/:token', handleResetPasswordGet);

router.post('/updateBanned', updateBanned);
router.post('/userDataUpload', userDataUpload);
router.post('/saveRotation', saveRotation);
// focus test below:
router.get('/', noNos, async (req, res) => {
  let user = req.user;
  let notifications = [];

  const db = getDb();
  const collection = db.collection('webappSettings');
  const collection1 = db.collection('sectionSettings');
  const collection2 = db.collection('chat_rooms_meta');
  const collection3 = db.collection('videos');
  const collection4 = db.collection('p2p_rooms');

  try {
    if (user && typeof user === 'object') {
      const userId = user._id.toString();

      // Fetch user avatar
      const myAvatar = await new Avatar().getAll({ userId: userId, assigned: true });
      user.myAvatar = myAvatar;

      // Fetch notifications where recipientId matches the userId
      const generalNotifications = await new Notify().getAll({ recipientId: userId });

      // Fetch notifications where recipientIds array includes the userId (for group notifications)
      const notifyGroup = await new Notify().getAll({ recipientIds: { $gt: [] } });
      const groupNotifications = notifyGroup.filter(notification => notification.recipientIds.includes(userId));

      // Fetch p2p notifications where recipientId matches the userId
      const p2pNotifications = await new Notify().getAll({ type: 'p2p', recipientId: userId });

      // Process all fetched notifications to add sender and recipient avatars if available
      const allNotifications = [...generalNotifications, ...groupNotifications, ...p2pNotifications];

      for (let notification of allNotifications) {
        // Fetch sender and recipient avatars
        const senderAvatar = await new Avatar().getAll({ userId: notification.senderId, assigned: true });
        const recipientAvatar = await new Avatar().getAll({ userId: notification.recipientId, assigned: true });

        // Attach sender and recipient avatars to the notification object
        notification.senderAvatarUrl = senderAvatar.length > 0 ? senderAvatar[0].avatarUrl : '/images/LogoTransp.png';
        notification.recipientAvatarUrl = recipientAvatar.length > 0 ? recipientAvatar[0].avatarUrl : '/images/LogoTransp.png';
      }

      // Combine all notifications into a single array
      notifications = allNotifications;
    }

    // Fetch other data for rendering
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

    // Render the index page with all the required data, including notifications
    res.render('index', {
      user: user,
      notifications: notifications, // Send all notifications to the template
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
