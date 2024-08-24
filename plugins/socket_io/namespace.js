import socket_middleware from './socket_middleware.js';

const { sessionMiddleware, passportMiddleware, authenticate } =
  socket_middleware;

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
