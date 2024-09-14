import express from 'express';
import videoStream from './chats/videoStream.js';
//import { getUserEditor, postUserEdit } from './users/userControl.js';
import chat from './chats/chat.js';
import users from './users/users.js';
import permissions from './permissions/permissions.js';
import videoLead from './videoLead/videoLead.js';
import videoProduction from './videoProduction/videoProduction.js';
import videos from './videos/videos.js';
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

router.use('/marquees', marquees);
router.use('/chat', chat);
router.use('/calendars', calendars);
router.use('/transactions', transactions);
router.use('/items', items);
router.use('/events', events);
router.use('/tickets', tickets);
router.use('/footers', footers);

router.use('/votes', votes);
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
router.use('/destinations', destinations);
router.use('/excursions', excursions);
router.use('/media', media);
router.use('/chats', chats);
router.use('/travels', travels);
router.use('/gems', gems);
router.use('/vendors', vendors);
router.use('/videos', videos);
router.use('/blogs', blogs);
router.use('/helps', helps);
router.use('/faqs', faqs);

/////P2P routes
router.use('/videoStream', videoStream);
////

// router.post('/postUserEdit', postUserEdit);
// router.get('/userEditor', getUserEditor);
// router.post('/userEdit/:id', postUserEdit);

export default router;
