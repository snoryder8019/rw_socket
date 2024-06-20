// /plugins/socket_io/setup.js
const socketIo = require('socket.io');
const sessionMiddleware = require('../../app').sessionMiddleware;
const passport = require('passport');
const { getDb } = require('../mongo/mongo');
const { savechatMessage, fetchLatestMessages } = require('./db');

const wrapMiddlewareForSocketIO = (middleware) => {
    return (socket, next) => {
        middleware(socket.request, {}, next);
    };
};

const configureNamespace = (io, namespace) => {
    const nsp = io.of(namespace);
    const users = {};

    nsp.use(wrapMiddlewareForSocketIO(sessionMiddleware));
    nsp.use(wrapMiddlewareForSocketIO(passport.session()));

    nsp.use((socket, next) => {
        if (socket.request.user) {
            next();
        } else {
            next(new Error('Unauthorized'));
        }
    });

    nsp.on('connection', (socket) => {
        const userName = socket.request.user.firstName;
        console.log(`rw_socket: ${userName} connected to ${namespace}`);
        const avatarImage = socket.request.user.images?.find(img => img.avatarTag === true) || null;
        const avatarThumbnailUrl = avatarImage ? avatarImage.thumbnailUrl : null;

        users[socket.id] = {
            userName: userName,
            avatarThumbnailUrl: avatarThumbnailUrl
        };

        socket.join('General');
        if (avatarThumbnailUrl) {
            socket.emit('user avatar', { thumbnailUrl: avatarThumbnailUrl });
        }
        
        nsp.to('General').emit('user list', Object.values(users).map(user => {
            return { userName: user.userName, avatarThumbnailUrl: user.avatarThumbnailUrl };
        }));

        socket.on('chat message', async (message) => {
            console.log(`/plugins/socket_io/setup.js: user: ${socket.request.user.email}`)
            const userAvatarImage = socket.request.user.images.find(img => img.avatarTag === true);
            const avatarThumbnailUrl = userAvatarImage ? userAvatarImage.thumbnailUrl : 'defaultThumbnail.png';
            const userId = socket.request.user._id;
            const roomId = '660834dfe387817ec2612c78';

            try {
                await savechatMessage(socket.request.user.key, socket.request.user.displayName, roomId, message, avatarThumbnailUrl);
                nsp.to('General').emit('chat message', {
                    message: message,
                    user: socket.request.user.displayName,
                    thumbnailUrl: avatarThumbnailUrl
                });
            } catch (error) {
                console.error('Error sending message:', error);
            }
        });

        socket.on('fetch messages', async ({ roomId, page, messagesPerPage }) => {
            try {
                const messages = await fetchLatestMessages(roomId, page, messagesPerPage);
                socket.emit('messages fetched', messages);
            } catch (error) {
                console.error('Error fetching messages:', error);
                socket.emit('error fetching messages', 'Failed to fetch messages');
            }
        });

        socket.on('join room', (room) => {
            socket.join(room);
        });

        socket.on('chat message in room', ({ room, msg }) => {
            nsp.to(room).emit('chat message', { text: msg, user: socket.request.user });
        });

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
