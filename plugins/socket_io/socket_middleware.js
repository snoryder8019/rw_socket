// socket_middleware.js
const { sessionMiddleware } = require('../../app');
const passport = require('passport');

const wrapMiddlewareForSocketIO = (middleware) => {
    return (socket, next) => {
        middleware(socket.request, {}, next);
    };
};

module.exports = {
    sessionMiddleware: wrapMiddlewareForSocketIO(sessionMiddleware),
    passportMiddleware: wrapMiddlewareForSocketIO(passport.session()),
    authenticate: (socket, next) => {
        if (socket.request.user) {
            next();
        } else {
            next(new Error('Unauthorized'));
        }
    }
};
