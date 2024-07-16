// /plugins/socket_ionamespace.js
const { sessionMiddleware, passportMiddleware, authenticate } = require('./socket_middleware');

const configureNamespace = (io, namespace, namespaceHandlers) => {
    const nsp = io.of(namespace);
    const users = {};

    nsp.use(sessionMiddleware);
    nsp.use(passportMiddleware);
    nsp.use(authenticate);

    nsp.on('connection', (socket) => {
        namespaceHandlers.onConnection(nsp, socket, users);
    });
};

module.exports = configureNamespace;
