const express = require('express');
const router = express.Router();

// Import necessary modules
const socketIo = require('socket.io');

// Define route for chat page
// router.get('/', (req, res) => {
//     // Render the chat page and pass the user object to the EJS template
//     res.render('index', { user: req.user });
// });

// Export the router
module.exports = router;

// Set up Socket.IO events
module.exports.setupSocketIO = (server) => {
    const io = socketIo(server);

    io.on('connection', (socket) => {
        console.log('A user connected');

        socket.on('stream', (data) => {
            // Broadcast the video data to all connected clients
            socket.broadcast.emit('stream', data);
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
