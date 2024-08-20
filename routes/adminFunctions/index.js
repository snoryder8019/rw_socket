import express from 'express';
import videoStream from './chat/videoStream.js';
import {
  ticketUpdate,
  ticketDelete,
  ticketData,
} from './help/ticketFunctions.js';
import { getUserEditor, postUserEdit } from './users/userControl.js';
import chat from './chat/chat.js';
import users from './users/users.js';
import permissions from './permissions/permissions.js';
import videoLead from './videoLead/videoLead.js';
import videoProduction from './videoProduction/videoProduction.js';
import clubs from './clubs/clubs.js';
import webappSettings from './webappSettings/webappSettings.js';
import notifications from './notifications/notifications.js';
import sectionSettings from './webappSettings/sectionSettings.js';
import subscriptions from './subscriptions/subscriptions.js';
import generalEditor from './generalEditor.js';

const router = express.Router();

router.use('/chat', chat);

router.use('/users', users);
router.use('/permissions', permissions);
router.use('/videoLead', videoLead);
router.use('/videoProduction', videoProduction);
router.use('/clubs', clubs);
router.use('/webappSettings', webappSettings);
router.use('/notifications', notifications);
router.use('/sectionSettings', sectionSettings);
router.use('/subscriptions', subscriptions);
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
