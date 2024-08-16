import express from 'express';
import videoStream from './chat/videoStream.js';
import {
  ticketUpdate,
  ticketDelete,
  ticketData,
} from './help/ticketFunctions.js';
import { getUserEditor, postUserEdit } from './users/userControl.js';
import chat from './chat/chat.js';

const router = express.Router();

router.use('/chat', chat);

const users = require('./users/users');
router.use('/users', users);
const permissions = require('./permissions/permissions');
router.use('/permissions', permissions);
const videoLead = require('./videoLead/videoLead');
router.use('/videoLead', videoLead);
const videoProduction = require('./videoProduction/videoProduction');
router.use('/videoProduction', videoProduction);
const clubs = require('./clubs/clubs');
router.use('/clubs', clubs);
const webappSettings = require('./webappSettings/webappSettings');
router.use('/webappSettings', webappSettings);
const notifications = require('./notifications/notifications');
router.use('/notifications', notifications);
const sectionSettings = require('./webappSettings/sectionSettings');
router.use('/sectionSettings', sectionSettings);
const subscriptions = require('./subscriptions/subscriptions');
router.use('/subscriptions', subscriptions);
const generalEditor = require('./generalEditor');
router.use('/generalEditor', generalEditor);
router.get('/ticketData', ticketData);
router.post('/ticketUpdate', ticketUpdate);
router.post('/ticketDelete', ticketDelete);

/////P2P routes
router.use('/videoStream', videoStream);
////

router.post('/postUserEdit', postUserEdit);
router.get('/userEditor', getUserEditor);
router.post('/userEdit/:id', postUserEdit);

export default router;
