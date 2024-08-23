const express = require('express');
const router = express.Router();
const cookieParser = require('cookie-parser');
const pluginsRouter = require('../plugins');
const cookiesRouter = require('./userFunctions/cookies');
const adminFunctionsRouter = require('./adminFunctions');
const users = require('./userFunctions');
const { getDb } = require('../plugins/mongo/mongo');
const noNos = require('./securityFunctions/forbiddens');
const { resetPasswordRequest, resetPassword, handleResetPasswordGet } = require('../plugins/passport/passwordReset');
const { userDataUpload, submitTicket, saveRotation, assignAvatar, deleteAvatar } = require('./userFunctions/userFunctions');
const { updateBanned } = require('./securityFunctions/updateBanned');
const upload = require('../plugins/multer/setup');
const userBucketRouter = require('./userFunctions/userBucketFunctions');
const { getNotifications } = require('./userFunctions/userNotifications');
const gamesRouter = require('./gamesFunctions/index');

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
          lastVisit:  req.cookies.lastVisit,
          userName: req.cookies.userName,
          visitCount:parseInt(req.cookies.visitCount)
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

module.exports = router;
