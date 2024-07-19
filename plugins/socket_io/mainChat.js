// /plugins/socket_io/mainChat.js
const { savechatMessage, fetchLatestMessages } = require('./db');

const mainChatHandlers = {
    onConnection: (nsp, socket, users) => {
        const user = socket.request.user;
        const userName = user.firstName;
        console.log(`MAINCHAT.JS ~ User: ${userName} connected to main_chat`);

        const avatarImage = user.images?.find(img => img.avatarTag) || {};
        const avatarThumbnailUrl = avatarImage.thumbnailUrl || 'defaultThumbnail.png';

        users[socket.id] = { userName, avatarThumbnailUrl };

        socket.join('General');
        socket.emit('user avatar', { thumbnailUrl: avatarThumbnailUrl });

        nsp.to('General').emit('user list', Object.values(users));

        socket.on('chat message', async (message,roomId) => {
   
            try {
                await savechatMessage(user.key, user.displayName, roomId, message, avatarThumbnailUrl);
                nsp.to('General').emit('chat message', {
                    roomId:roomId,
                    message,
                    user: user.displayName,
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
            nsp.to(room).emit('chat message', { text: msg, user });
        });

        socket.on('disconnect', () => {
            delete users[socket.id];
            nsp.to('General').emit('user list', Object.values(users));
        });
    }
};

module.exports = mainChatHandlers;
