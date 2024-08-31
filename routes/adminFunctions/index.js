import express from 'express';
import videoStream from './chats/videoStream.js';
import { getUserEditor, postUserEdit } from './users/userControl.js';
import chat from './chats/chat.js';
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
import destinations from './destinations/destinations.js';
import excursions from './excursions/excursions.js';
import media from './media/media.js';
import chats from './chats/chat.js';
import travels from './travels/travels.js';
import gems from './gems/gems.js';
import vendors from './vendors/vendors.js';
import videos from './videoProduction/videos.js';
import votes from './votes/votes.js';
import blogs from './blogs/blogs.js';
import helps from './helps/helps.js';
import faqs from './faqs/faqs.js';
import events from './events/events.js';
import footers from './footers/footers.js';
import marquees from './marquees/marquees.js';
import tickets from './tickets/tickets.js';
import transactions from './transactions/transactions.js';
import items from './items/items.js';
import calendars from './calendars/calendars.js';

const router = express.Router();
const permissionsChecker = async (req, res, next) => {
  // Check if user exists
  if (!req.user) {
    console.log('Permission denied: No user found');
    return res.status(403).json({ message: 'Forbidden: No user found' });
  }

  const pathSplit = req.originalUrl.split('/');
  const permission = pathSplit[1]; // Grab the first part of the path after '/'
  const userPermissions = req.user.permissions;
  const user = req.user.firstName + ' ' + req.user.lastName;

  // Check if the permission exists and is granted
  if (
    userPermissions.full ||
    (userPermissions && userPermissions[permission] === true)
  ) {
    console.log(
      `${user}: Permission granted for ${permission}, full access:${userPermissions.full}`
    );
    next(); // Permission granted, proceed to the next middleware
  } else {
    console.log(`Permission denied: ${permission}`);
    return res
      .status(403)
      .json({ message: 'Forbidden: Insufficient permissions' });
  }
};

router.use('/marquees', permissionsChecker, marquees);
router.use('/chat', permissionsChecker, chat);
router.use('/calendars', permissionsChecker, calendars);
router.use('/transactions', permissionsChecker, transactions);
router.use('/items', permissionsChecker, items);
router.use('/events', permissionsChecker, events);
router.use('/tickets', permissionsChecker, tickets);
router.use('/footers', permissionsChecker, footers);

router.use('/votes', permissionsChecker, votes);
router.use('/users', permissionsChecker, users);
router.use('/permissions', permissionsChecker, permissions);
router.use('/videoLead', permissionsChecker, videoLead);
router.use('/videoProduction', permissionsChecker, videoProduction);
router.use('/clubs', permissionsChecker, clubs);
router.use('/webappSettings', permissionsChecker, webappSettings);
router.use('/notifications', permissionsChecker, notifications);
router.use('/sectionSettings', permissionsChecker, sectionSettings);
router.use('/subscriptions', permissionsChecker, subscriptions);
router.use('/generalEditor', permissionsChecker, generalEditor);
router.use('/destinations', permissionsChecker, destinations);
router.use('/excursions', permissionsChecker, excursions);
router.use('/media', permissionsChecker, media);
router.use('/chats', permissionsChecker, chats);
router.use('/travels', permissionsChecker, travels);
router.use('/gems', permissionsChecker, gems);
router.use('/vendors', permissionsChecker, vendors);
router.use('/videos', permissionsChecker, videos);
router.use('/blogs', permissionsChecker, blogs);
router.use('/helps', permissionsChecker, helps);
router.use('/faqs', permissionsChecker, faqs);

/////P2P routes
router.use('/videoStream', videoStream);
////

router.post('/postUserEdit', postUserEdit);
router.get('/userEditor', getUserEditor);
router.post('/userEdit/:id', postUserEdit);

export default router;
