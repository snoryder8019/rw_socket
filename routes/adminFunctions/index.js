var express = require('express');
var router = express.Router();
const videoStream = require('./chat/videoStream')
const {ticketUpdate,ticketDelete, ticketData} = require('./help/ticketFunctions')
const {isAdmin,gatherIp} = require('./adminFunctions')
const {getUserEditor,postUserEdit} = require('./users/userControl')


const destinations = require('./destinations/destinations');
router.use('/destinations',destinations);
const excursions = require('./excursions/excursions');
router.use('/excursions',excursions);
const permissions = require('./permissions/permissions');
router.use('/permissions',permissions);
const media = require('./media/media');
router.use('/media',media);
const chat = require('./chat/chat');
router.use('/chat',chat);
const travels = require('./travels/travels');
router.use('/travels',travels);

const gems = require('./gems/gems');
router.use('/gems',gems);

const users = require('./users/users');
router.use('/users',users);
const vendors = require('./vendors/vendors');
router.use('/vendors',vendors);

const videoLead = require('./videoLead/videoLead');
router.use('/videoLead',videoLead);
const videoProduction = require('./videoProduction/videoProduction');
router.use('/videoProduction',videoProduction);
const clubs = require('./clubs/clubs');
router.use('/clubs',clubs);
const webappSettings = require('./webappSettings/webappSettings');
router.use('/webappSettings',webappSettings);
const notifications = require('./notifications/notifications');
router.use('/notifications',notifications);
const sectionSettings = require('./webappSettings/sectionSettings');
router.use('/sectionSettings',sectionSettings);
const subscriptions = require('./subscriptions/subscriptions');
router.use('/subscriptions',subscriptions);
const generalEditor = require('./generalEditor');
router.use('/generalEditor',generalEditor);
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