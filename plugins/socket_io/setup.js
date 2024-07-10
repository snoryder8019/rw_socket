// setup.js
const socketIo = require('socket.io');
const configureNamespace = require('./namespace');
const mainChatHandlers = require('./mainChat');
const { configureVideoNamespace } = require('./videoProduction');

const setupSocketIO = (server) => {
    const io = socketIo(server);
    configureNamespace(io, '/main_chat', mainChatHandlers);
    configureVideoNamespace(io); // Ensure this line sets up the video production namespace
};

module.exports = {
    setupSocketIO
};
