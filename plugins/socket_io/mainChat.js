import { savechatMessage, fetchLatestMessages } from './db.js';
import Avatar from '../mongo/models/Avatar.js';

const avatarGetter = (userId, callback) => {
  new Avatar().getAll({ userId: userId.toString(), assigned: true })
    .then(avatars => {
      const avatarUrl = avatars.length > 0 ? avatars[0].avatarUrl : 'images/logo_rst.png';
      callback(avatarUrl);
    })
    .catch(error => {
      console.error('Error fetching avatar:', error);
      callback('images/logo_rst.png'); // Fallback in case of error
    });
};

export const mainChatHandlers = {
  onConnection: (nsp, socket, users) => {
    const user = socket.request.user;
    const userName = user.firstName;
    console.log(`MAINCHAT.JS ~ User: ${userName} connected to main_chat`);

    avatarGetter(user._id.toString(), (avatarThumbnailUrl) => {
      // Store avatarThumbnailUrl in the users object or socket object
      users[socket.id] = { userName, avatarThumbnailUrl };

      socket.join('General');
      socket.emit('user avatar', { thumbnailUrl: avatarThumbnailUrl });

      nsp.to('General').emit('user list', Object.values(users));
    });

    // Handle incoming replies from socket
    socket.on('replyMessage', async (data) => {
      const { postId, replyMessage } = data;
      const userId = user._id;
    
      // Ensure the avatar is always available before sending a reply
      const avatarThumbnail = users[socket.id]?.avatarThumbnailUrl || 'images/logo_rst.png'; // Use fallback if not available
    
      try {
        const replyData = { postId, userId, replyMessage,avatarThumbnail };
        
        // Call the replyPost logic from routes
        const result = await replyPost(replyData);
    
        if (result.error) {
          socket.emit('replyError', result.error);  // Send error to client if any
        } else {
          nsp.to('General').emit('newReply', { postId, reply: result.reply, thumbnailUrl: avatarThumbnail });
        }
      } catch (error) {
        console.error('Error handling reply:', error);
        socket.emit('replyError', 'Error handling reply');
      }
    });
    
    // Existing chat message logic
    socket.on('chat message', async (message, roomId) => {
      const avatarThumbnail = users[socket.id]?.avatarThumbnailUrl || 'images/logo_rst.png';  // Use fallback if not available
      try {
        await savechatMessage(user.key, user.displayName, roomId, message, avatarThumbnail);
        nsp.to('General').emit('chat message', {
          roomId: roomId,
          message,
          user: user.displayName,
          thumbnailUrl: avatarThumbnail,  // Use the avatar from users[socket.id]
        });
      } catch (error) {
        console.error('Error sending message:', error);
      }
    });
    

    socket.on('likeUpdated', async ({ postId, likes }) => {
      try {
        // Emit the like update to all clients in the room
        nsp.to('General').emit('likeUpdated', { postId, likes });
      } catch (error) {
        console.error('Error updating likes:', error);
      }
    });
    
    // Emit a new reply event when a reply is added
    socket.on('newReply', ({ postId, reply }) => {
      const actionsDiv = document.getElementById(`${postId}_actions`);
      if (!actionsDiv) return;

      const repliesContainer = actionsDiv.parentElement.querySelector('.repliesContainer');
      if (!repliesContainer) return;

      // Append the new reply to the replies container
      renderSingleReply(reply, repliesContainer);

      // Ensure the replies are visible
      repliesContainer.style.display = 'block';

      // Optionally update reply counter if you're showing one
      const repliesCounter = actionsDiv.querySelector('.repliesCounter');
      if (repliesCounter) {
        const currentRepliesCount = parseInt(repliesCounter.textContent) || 0;
        repliesCounter.textContent = `${currentRepliesCount + 1} ${currentRepliesCount + 1 === 1 ? 'reply' : '🗨️'}`;
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

    socket.on('marquee', (data) => {
      console.log(`mainchat marquee data: ${data.message}`);
      nsp.to('General').emit('marquee', data);
    });

    socket.on('broadcast', (videoUrl) => {
      console.log(`broadcasting to 1 video url: ${videoUrl}`);
      nsp.to('General').emit('broadcast', { videoUrl });
    });

    socket.on('disconnect', () => {
      delete users[socket.id];
      nsp.to('General').emit('user list', Object.values(users));
    });
  }
};
