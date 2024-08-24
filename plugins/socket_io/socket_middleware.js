import { sessionMiddleware } from '../../app.js';
import passport from 'passport';

const wrapMiddlewareForSocketIO = (middleware) => {
  return (socket, next) => {
    middleware(socket.request, {}, next);
  };
};

export default {
  sessionMiddleware: wrapMiddlewareForSocketIO(sessionMiddleware),
  passportMiddleware: wrapMiddlewareForSocketIO(passport.session()),
  authenticate: (socket, next) => {
    if (socket.request.user) {
      next();
    } else {
      next(new Error('Unauthorized'));
    }
  },
};
