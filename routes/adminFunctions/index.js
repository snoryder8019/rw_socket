var express = require('express');
var router = express.Router();

const {ticketUpdate,ticketDelete, ticketData} = require('./help/ticketFunctions')
const {isAdmin,gatherIp} = require('./adminFunctions')
const {getUserEditor,postUserEdit} = require('./users/userControl')


const users = require('./users/users');
router.use('/users',users);
const permissions = require('./permissions/permissions');
router.use('/permissions',permissions);
const videoLead = require('./videoLead/videoLead');
router.use('/videoLead',videoLead);
const videoProduction = require('./videoProduction/videoProduction');
router.use('/videoProduction',videoProduction);
const clubs = require('./clubs/clubs');
router.use('/clubs',clubs);
const webappSettings = require('./webappSettings/webappSettings');
router.use('/webappSettings',webappSettings);
const sectionSettings = require('./webappSettings/sectionSettings');
router.use('/sectionSettings',sectionSettings);
const subscriptions = require('./subscriptions/subscriptions');
router.use('/subscriptions',subscriptions);
const generalEditor = require('./generalEditor');
router.use('/generalEditor',generalEditor);
router.get('/ticketData',ticketData)
router.post('/ticketUpdate', ticketUpdate);
router.post('/ticketDelete', ticketDelete);

router.post('/postUserEdit',postUserEdit)
router.get('/userEditor',getUserEditor)
router.post('/userEdit/:id',postUserEdit)

module.exports = router;