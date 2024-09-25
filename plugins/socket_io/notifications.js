import Notify from '../mongo/models/notifications/Notify.js';
import Notification from '../mongo/models/notifications/Notification.js';
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

export const notificationsHandlers = {
  onConnection: (nsp, socket, users) => {
    const user = socket.request.user;
    const userName = user.firstName;
    console.log(`USERNOTIFICATIONS.JS ~ User: ${userName} connected to user_notifications`);

    avatarGetter(user._id.toString(), (avatarThumbnailUrl) => {
      // Store avatarThumbnailUrl in the users object or socket object
      users[socket.id] = { userName, avatarThumbnailUrl };

      socket.join('Notifications');
      socket.emit('user avatar', { thumbnailUrl: avatarThumbnailUrl });

      nsp.to('Notifications').emit('user list', Object.values(users));
    });

    // Send new notification
    socket.on('newNotification', async (notificationData) => {
      const { title, message, recipientIds } = notificationData;
      const userId = user._id;
      const avatarThumbnail = users[socket.id]?.avatarThumbnailUrl || 'images/logo_rst.png';

      try {
        const notify = new Notify({
          notificationId: `${Date.now()}_${userId}`,
          recipientIds,
          recipientType: 'user',
          status: 'pending',
          title,
          message,
          avatarThumbnail,
        });

        // Send the notification
        const result = await notify.send(notify.modelFields);
        console.log('Notification sent:', result);

        // Stamp as sent
        for (let recipientId of recipientIds) {
          await notify.stampAsSent(notify.modelFields.notificationId.value, recipientId);
        }

        nsp.to('Notifications').emit('newNotification', { title, message, thumbnailUrl: avatarThumbnail });
      } catch (error) {
        console.error('Error sending notification:', error);
        socket.emit('notificationError', 'Error sending notification');
      }
    });

    // Fetch notifications
    socket.on('fetch notifications', async ({ userId, page, notificationsPerPage }) => {
      try {
        const notifications = await new Notification().fetchForUser(userId, page, notificationsPerPage);
        socket.emit('notifications fetched', notifications);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        socket.emit('error fetching notifications', 'Failed to fetch notifications');
      }
    });

    // Mark notification as seen
    socket.on('notificationSeen', async ({ notificationId, recipientId }) => {
      try {
        const notify = new Notify();
        await notify.stampAsSeen(notificationId, recipientId);
        console.log(`Notification ${notificationId} marked as seen by ${recipientId}`);
      } catch (error) {
        console.error('Error marking notification as seen:', error);
        socket.emit('notificationError', 'Error marking notification as seen');
      }
    });

    // Handle unsubscribe
    socket.on('unsubscribe', async ({ notificationId, recipientId }) => {
      try {
        const notify = new Notify();
        await notify.unsubscribeRecipient(notificationId, recipientId);
        console.log(`Recipient ${recipientId} unsubscribed from notification ${notificationId}`);
      } catch (error) {
        console.error('Error unsubscribing recipient:', error);
        socket.emit('notificationError', 'Error unsubscribing from notification');
      }
    });

    // Schedule a notification
    socket.on('scheduleNotification', async ({ notificationData, interval }) => {
      try {
        const notify = new Notify();
        const result = await notify.scheduleNotification(notificationData, interval);
        console.log('Notification scheduled:', result);
      } catch (error) {
        console.error('Error scheduling notification:', error);
        socket.emit('notificationError', 'Error scheduling notification');
      }
    });

    socket.on('disconnect', () => {
      delete users[socket.id];
      nsp.to('Notifications').emit('user list', Object.values(users));
    });
  }
};
