import express from 'express';
import { Server } from 'socket.io';
import { configureNamespace } from './namespace.js';
import { mainChatHandlers } from './mainChat.js';
import { notificationsHandlers } from './notifications.js';
import { socketAdminHandlers } from './socketAdmin.js';
import { socketP2PHandlers } from './videoStream.js';
import { socketGamesHandlers } from './games.js';

export const router = express.Router();
router.use((req, res, Server, next) => {
  const io = new Server(server);
  req.io = io;
  next();
});

//setupSocketIO is mounted to the app > /bin/www
//Configure new namespaces here
export const setupSocketIO = (server) => {
  const io = new Server(server);
  configureNamespace(io, '/main_chat', mainChatHandlers);
  configureNamespace(io, '/notifications', notificationsHandlers);
  configureNamespace(io, '/socketAdmin', socketAdminHandlers);
  configureNamespace(io, '/videoStream', socketP2PHandlers);
  configureNamespace(io, '/games', socketGamesHandlers);
};
