var express = require('express');
var router = express.Router();
const videoStream = require('./chats/videoStream')
const {ticketUpdate,ticketDelete, ticketData} = require('./help/ticketFunctions')
const {isAdmin,gatherIp} = require('./adminFunctions')
const {getUserEditor,postUserEdit} = require('./users/userControl')


const permissionsChecker = async (req, res, next) => {
    const pathSplit = req.originalUrl.split('/');
    const permission = pathSplit[1]; // Grab the first part of the path after '/'
    const userPermissions = req.user.permissions;
  const user = req.user.firstName + " "+ req.user.lastName;
    // Check if the permission exists and is granted
    if (userPermissions.full|| userPermissions && userPermissions[permission] === true) {
      
        console.log(`${user}: Permission granted for ${permission}, full access:${userPermissions.full}`);
      next(); // Permission granted, proceed to the next middleware
    } else {
      console.log(`Permission denied: ${permission}`);
      return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
    }
  };
  
const destinations = require('./destinations/destinations');
router.use('/destinations',permissionsChecker,destinations);
const excursions = require('./excursions/excursions');
router.use('/excursions',permissionsChecker,excursions);
const permissions = require('./permissions/permissions');
router.use('/permissions',permissionsChecker,permissions);
const media = require('./media/media');
router.use('/media',permissionsChecker,media);
const chats = require('./chats/chat');
router.use('/chats',permissionsChecker,chats);
const travels = require('./travels/travels');
router.use('/travels',permissionsChecker,travels);

const gems = require('./gems/gems');
router.use('/gems',permissionsChecker,gems);

const users = require('./users/users');
router.use('/users',permissionsChecker,users);
const vendors = require('./vendors/vendors');
router.use('/vendors',permissionsChecker,vendors);

const videoLead = require('./videoLead/videoLead');
router.use('/videoLead',permissionsChecker,videoLead);
const videoProduction = require('./videoProduction/videoProduction');
router.use('/videoProduction',permissionsChecker,videoProduction);
const videos = require('./videoProduction/videos');
router.use('/videos',permissionsChecker,videos);
const clubs = require('./clubs/clubs');
router.use('/clubs',permissionsChecker,clubs);
const blogs = require('./blogs/blogs');
router.use('/blogs',permissionsChecker,blogs);
const webappSettings = require('./webappSettings/webappSettings');
router.use('/webappSettings',permissionsChecker,webappSettings);
const notifications = require('./notifications/notifications');
router.use('/notifications',permissionsChecker,notifications);
const sectionSettings = require('./webappSettings/sectionSettings');
router.use('/sectionSettings',permissionsChecker,sectionSettings);
const subscriptions = require('./subscriptions/subscriptions');
router.use('/subscriptions',permissionsChecker,subscriptions);
const generalEditor = require('./generalEditor');
router.use('/generalEditor',permissionsChecker,generalEditor);
router.get('/ticketData',ticketData)
router.post('/ticketUpdate', ticketUpdate);
router.post('/ticketDelete', ticketDelete);


/////P2P routes
router.use('/videoStream', videoStream)
////





router.post('/postUserEdit',postUserEdit)
router.get('/userEditor',getUserEditor)
router.post('/userEdit/:id',postUserEdit)

module.exports = router;