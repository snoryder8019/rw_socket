const socketIo = require('socket.io');
const sessionMiddleware = require('../../app').sessionMiddleware;
const passport = require('passport');
const { savechatMessage, fetchLatestMessages } = require('./db');

const wrapMiddlewareForSocketIO = (middleware) => {
    return (socket, next) => {
        middleware(socket.request, {}, next);
    };
};

const configureNamespace = (io, namespace) => {
    const nsp = io.of(namespace);
    const users = {};

    // Use session middleware and passport for authentication
    nsp.use(wrapMiddlewareForSocketIO(sessionMiddleware));
    nsp.use(wrapMiddlewareForSocketIO(passport.session()));

    // Middleware to check if the user is authenticated
    nsp.use((socket, next) => {
        if (socket.request.user) {
            next();
        } else {
            next(new Error('Unauthorized'));
        }
    });

    // Handle connection event
    nsp.on('connection', (socket) => {
        const user = socket.request.user;
        const userName = user.firstName;
        console.log(`User: ${userName} connected to ${namespace}`);

        // Get user's avatar thumbnail URL
        const avatarImage = user.images?.find(img => img.avatarTag) || {};
        const avatarThumbnailUrl = avatarImage.thumbnailUrl || 'defaultThumbnail.png';

        users[socket.id] = { userName, avatarThumbnailUrl };

        socket.join('General');
        socket.emit('user avatar', { thumbnailUrl: avatarThumbnailUrl });

        // Emit updated user list to all clients
        nsp.to('General').emit('user list', Object.values(users));

        // Handle chat message event
        socket.on('chat message', async (message) => {
            const roomId = '660834dfe387817ec2612c78';
            try {
                await savechatMessage(user.key, user.displayName, roomId, message, avatarThumbnailUrl);
                nsp.to('General').emit('chat message', {
                    message,
                    user: user.displayName,
                    thumbnailUrl: avatarThumbnailUrl
                });
            } catch (error) {
                console.error('Error sending message:', error);
            }
        });

        // Handle fetch messages event
        socket.on('fetch messages', async ({ roomId, page, messagesPerPage }) => {
            try {
                const messages = await fetchLatestMessages(roomId, page, messagesPerPage);
                socket.emit('messages fetched', messages);
            } catch (error) {
                console.error('Error fetching messages:', error);
                socket.emit('error fetching messages', 'Failed to fetch messages');
            }
        });

        // Handle join room event
        socket.on('join room', (room) => {
            socket.join(room);
        });

        // Handle chat message in room event
        socket.on('chat message in room', ({ room, msg }) => {
            nsp.to(room).emit('chat message', { text: msg, user });
        });

        // Handle disconnect event
        socket.on('disconnect', () => {
            delete users[socket.id];
            nsp.to('General').emit('user list', Object.values(users));
        });
    });
};

module.exports.setupSocketIO = (server) => {
    const io = socketIo(server);
    configureNamespace(io, '/main_chat');
};
