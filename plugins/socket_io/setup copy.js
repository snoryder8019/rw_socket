
const socketIo = require('socket.io');
const sessionMiddleware = require('../../app').sessionMiddleware; // Assuming this exports your session middleware
const passport = require('passport');
const updateUsersList = require('../mongo/socketFunctions/update').sendConnectionMeta;
const {getDb}=require('../mongo/mongo')
const { ObjectId } = require('mongodb');
const {savechatMessage,fetchLatestMessages} = require('./db')
module.exports.setupSocketIO = (server) => {
    const io = socketIo(server);
    const mainChat = io.of('/main_chat');
    const users = {}; // Tracks connected users

    // Middleware for session handling
    const wrapMiddlewareForSocketIO = (middleware) => {
        return (socket, next) => {
            middleware(socket.request, {}, next);
        };
    };

    // Apply middleware for session and passport
    mainChat.use(wrapMiddlewareForSocketIO(sessionMiddleware));
    mainChat.use(wrapMiddlewareForSocketIO(passport.session()));

    // Reject connections without an authenticated user
    mainChat.use((socket, next) => {
        if (socket.request.user) {
            next();
        } else {
            next(new Error('Unauthorized'));
        }
    });

    mainChat.on('connection', (socket) => {
      const userName = socket.request.user.firstName;
      console.log(`${userName} connected to main_chat`);
      const avatarImage = socket.request.user.images?.find(img => img.avatarTag === true) || null;
      const avatarThumbnailUrl = avatarImage ? avatarImage.thumbnailUrl : null;
  
      users[socket.id] = {
          userName: userName,
          avatarThumbnailUrl: avatarThumbnailUrl // Store this for use in broadcasts or direct messages
      };
        socket.join('General');
        if (avatarThumbnailUrl) {
            socket.emit('user avatar', { thumbnailUrl: avatarThumbnailUrl });
        }
        // Notify all clients in the namespace about the updated user list
        mainChat.to('General').emit('user list', Object.values(users).map(user => {
            return { userName: user.userName, avatarThumbnailUrl: user.avatarThumbnailUrl };
        }));
                // Handle chat messages
                socket.on('chat message', async (message) => {
                    // Assuming socket.request.user is populated with the user model
                    const userAvatarImage = socket.request.user.images.find(img => img.avatarTag === true);
                    const avatarThumbnailUrl = userAvatarImage ? userAvatarImage.thumbnailUrl : 'defaultThumbnail.png';
                    const userId = socket.request.user._id; // Or use 'key' from user model if that's the intended identifier
                    const roomId = '660834dfe387817ec2612c78'; // Example roomId
                
                    try {
                        console.log(`setup.js console: userId: ${userId}`)
                        // Save the chat message
                        await savechatMessage(socket.request.user.key,socket.request.user.displayName ,roomId, message, avatarThumbnailUrl);
                        
                        // Broadcast the message
                        mainChat.to('General').emit('chat message', {
                            message: message,
                            user: socket.request.user.displayName, // Use displayName for the user's name
                            thumbnailUrl: avatarThumbnailUrl
                        });
                    } catch (error) {
                        console.error('Error sending message:', error);
                        // Handle the error, perhaps notify the user
                    }
                });
           // Inside mainChat.on('connection', (socket) => { ...

socket.on('fetch messages', async ({roomId, page}) => {
    const userId = socket.request.user._id; // Assuming user ID is necessary for message fetch
    try {
        const messages = await fetchLatestMessages(roomId, page);
        socket.emit('messages fetched', messages); // Send messages back to the requester
    } catch (error) {
        console.error('Error fetching messages:', error);
        // Optionally notify the client of the error
        socket.emit('error fetching messages', 'Failed to fetch messages');
    }
});
     
                
        // Handle joining specific rooms
        socket.on('join room', (room) => {
            socket.join(room);
            // Optionally, update users list for the room
        });

        // Handle chat messages in specific rooms
        socket.on('chat message in room', ({ room, msg }) => {
            mainChat.to(room).emit('chat message', { text: msg, user: socket.request.user });
        });

        // Handle disconnection
        socket.on('disconnect', () => {
            delete users[socket.id]; // Remove user from the list
            mainChat.to('General').emit('user list', Object.values(users)); // Update user list for all clients
        });
    });
};



