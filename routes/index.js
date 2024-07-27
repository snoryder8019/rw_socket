var express = require('express');
var router = express.Router();
const pluginsRouter = require('../plugins');
router.use(pluginsRouter)
const adminFunctionsRouter = require('./adminFunctions')
router.use('/',adminFunctionsRouter)
const system = require('./systemFunctions/systemFunctions')
const { getDb } = require('../plugins/mongo/mongo');
const noNos = require('./securityFunctions/forbiddens')

const {resetPasswordRequest, resetPassword, handleResetPasswordGet} = require('../plugins/passport/passwordReset')

const { userDataUpload, submitTicket, saveRotation,assignAvatar,deleteAvatar } = require('./userFunctions/userFunctions');
const {updateBanned}=require('./securityFunctions/updateBanned');
const upload = require('../plugins/multer/setup');
const userBucketRouter = require('./userFunctions/userBucketFunctions');
const {getNotifications} = require('./userFunctions/userNotifications');
const { config } = require('dotenv');
router.get('/getNotifications', getNotifications)
router.post('/deleteAvatar', deleteAvatar)
router.post('/assignAvatar', assignAvatar)
router.use(userBucketRouter);
const gamesRouter = require('./gamesFunctions/gamesFunctions')
router.use('/games',gamesRouter)
//ADMIN FUNCTIONS

//ADMIN FUNCITONS




router.post('/submitTicket', submitTicket);

router.post('/reset-password-request', resetPasswordRequest)
router.post('/passwordReset/:token', resetPassword)
router.get('/reset-password/:token', handleResetPasswordGet);

router.post('/updateBanned', updateBanned);
router.post('/userDataUpload', userDataUpload)
router.post('/saveRotation',saveRotation)


//router.post('/ticketNotify', ticketNotify);


/* GET home page. */
router.get('/',noNos, async (req, res) => {
  let user = req.user;
 const db = getDb();
const collection = db.collection('webappSettings');
const collection1 = db.collection('sectionSettings');
const collection2 = db.collection('chat_rooms_meta');
const collection3 = db.collection('videos');
const collection4 = db.collection('p2p_rooms');
try{
  const webappSettings = await collection.find().toArray()
  const sectionSettings = await collection1.find().toArray()
  const chatRooms = await collection2.find().toArray()
  const videos = await collection3.find().toArray()
  const p2p_rooms = await collection4.find().toArray()
 // console.log(webappSettings)
  res.render('index', {
    user: user,
    webappSettings:webappSettings,
    sectionSettings:sectionSettings,
    chatRooms:chatRooms,
    rooms:p2p_rooms,
    videos:videos,
    message: req.flash(),
  });
}
catch(error){console.error(error);res.send(`error:${error}`)}
 //const message= req.flash()
// console.log(req.flash('message'))
});




module.exports = router;
