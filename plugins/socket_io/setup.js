// /plugins/socket_io/setup.js
const socketIo = require('socket.io');
const configureNamespace = require('./namespace');
const mainChatHandlers = require('./mainChat');
const { configureVideoNamespace } = require('./videoProduction');
const express = require('express')
const router = express.Router();
router.use((req,res,socketIo,next)=>{
    const io = socketIo(server);
    req.io = io
    next()
})

//setupSocketIO is mounted to the app > /bin/www
//Configure new namespaces here
const setupSocketIO = (server) => {
    const io = socketIo(server); 
    configureNamespace(io, '/main_chat', mainChatHandlers);
   // configureVideoNamespace(io,'/video_production'); // Ensure this line sets up the video production namespace
};

module.exports = {
    setupSocketIO,router
};
