const express = require('express');
const router = express.Router();
const socketIo = require('socket.io');

// Export the router
module.exports = router;

// Set up Socket.IO events
module.exports.setupSocketIO = (server) => {
    const io = socketIo(server);

    io.on('connection', (socket) => {
        console.log('A user connected');

        // Listen for video streaming data from clients
        socket.on('stream', (data) => {
            // Broadcast the video data to all connected clients
            io.emit('stream', data);
        });

        // Listen for chat messages from clients
        socket.on('chat message', (msg) => {
            console.log('message: ' + msg);
            // Broadcast the message to all connected clients
            io.emit('chat message', msg);
        });

        // Handle disconnection
        socket.on('disconnect', () => {
            console.log('User disconnected');
        });
    });
};
