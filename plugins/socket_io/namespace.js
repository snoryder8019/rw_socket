import {
  sessionMiddleware,
  passportMiddleware,
  authenticate,
} from './socket_middleware.js';

export const configureNamespace = (io, namespace, namespaceHandlers) => {
  const nsp = io.of(namespace);
  const users = {};

  nsp.use(sessionMiddleware);
  nsp.use(passportMiddleware);
  nsp.use(authenticate);

  nsp.on('connection', (socket) => {
    namespaceHandlers.onConnection(nsp, socket, users);
  });
};
