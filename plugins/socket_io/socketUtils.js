// /plugins/socket_io/socketUtils.js
const wrapMiddlewareForSocketIO = (middleware) => {
    return (socket, next) => {
        middleware(socket.request, {}, next);
    };
};

const configureNamespace = (io, namespace, onConnection) => {
    const nsp = io.of(namespace);

    nsp.use(wrapMiddlewareForSocketIO(require('../../app').sessionMiddleware));
    nsp.use(wrapMiddlewareForSocketIO(require('passport').session()));

    nsp.use((socket, next) => {
        if (socket.request.user) {
            next();
        } else {
            next(new Error('Unauthorized'));
        }
    });

    nsp.on('connection', (socket) => {
        onConnection(socket, nsp);
    });
};

module.exports = {
    wrapMiddlewareForSocketIO,
    configureNamespace,
};
