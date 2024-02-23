const setupPassport = require('./setup');
const authRoutes = require('./auth');
const { createUser } = require('./localStrat');

module.exports = {
    setupPassport,
    authRoutes,
    createUser
};
