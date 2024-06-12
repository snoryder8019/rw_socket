var express = require('express');
var router = express.Router();
const pluginsRouter = require('../plugins');
router.use(pluginsRouter)
const system = require('./systemFunctions/systemFunctions')
const { getDb } = require('../plugins/mongo/mongo');
const noNos = require('./securityFunctions/forbiddens')
const {ticketUpdate,ticketDelete, ticketData} = require('./adminFunctions/ticketFunctions')
const {resetPasswordRequest, resetPassword, handleResetPasswordGet} = require('../plugins/passport/passwordReset')
const {isAdmin,gatherIp} = require('./adminFunctions/adminFunctions')
const {getUserEditor,postUserEdit} = require('./adminFunctions/userControl')
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


//ADMIN FUNCTIONS
const users = require('./adminFunctions/users/users');
router.use('/users',users);
const permissions = require('./adminFunctions/permissions/permissions');
router.use('/permissions',permissions);
const videoLead = require('./adminFunctions/videoLead/videoLead');
router.use('/videoLead',videoLead);
//ADMIN FUNCITONS




router.post('/submitTicket', submitTicket);
router.get('/ticketData',ticketData)
router.post('/reset-password-request', resetPasswordRequest)
router.post('/passwordReset/:token', resetPassword)
router.get('/reset-password/:token', handleResetPasswordGet);
router.post('/ticketUpdate', ticketUpdate);
router.post('/ticketDelete', ticketDelete);
router.post('/updateBanned', updateBanned);
router.post('/userDataUpload', userDataUpload)
router.post('/saveRotation',saveRotation)
router.post('/postUserEdit',postUserEdit)
router.get('/userEditor',getUserEditor)
router.post('/userEdit/:id',postUserEdit)

//router.post('/ticketNotify', ticketNotify);


/* GET home page. */
router.get('/',noNos, async (req, res) => {
  let user = req.user;

 const db = getDb();
const collection = db.collection('tickets');
try{
  const tickets = await collection.find().toArray()
  res.render('index', { 
    user: user, 
    tickets:tickets,
    message: req.flash(),
 
    
    
  });
}
catch(error){console.error(error);res.send(`error:${error}`)}
 //const message= req.flash()
// console.log(req.flash('message'))
});




module.exports = router;
