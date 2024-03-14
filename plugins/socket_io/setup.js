
const socketIo = require('socket.io');
const sessionMiddleware = require('../../app').sessionMiddleware; // Assuming this exports your session middleware
const passport = require('passport');
const updateUsersList = require('../mongo/socketFunctions/update').sendConnectionMeta;

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
                socket.on('chat message', (msg) => {
                    // Assuming the user's avatar information is part of `socket.request.user.images`
                    // and you are looking for the image where `avatarTag === true`
                    const userAvatar = socket.request.user.images.find(img => img.avatarTag === true);
                    const avatarThumbnailUrl = userAvatar ? userAvatar.thumbnailUrl : 'defaultThumbnail.png'; // Use a default thumbnail if none is set
                console.log(avatarThumbnailUrl)
                    // Broadcast the message to all clients in "General" room within the main_chat namespace
                    // Now includes the avatarThumbnailUrl in the data being sent
                    mainChat.to('General').emit('chat message', {
                        text: msg,
                        user: socket.request.user,
                        thumbnailUrl: avatarThumbnailUrl // Assuming you're correctly assigning this variable on the server
                    });
                    
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



