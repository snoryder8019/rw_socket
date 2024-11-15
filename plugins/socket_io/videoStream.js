import { getDb } from '../../plugins/mongo/mongo.js';
import { ObjectId } from 'mongodb';

export const socketP2PHandlers = {
  onConnection: (nsp, socket, users) => {
    const user = socket.request.user;

    console.log(`${user.firstName} connected to the video stream`);

    // Handle room joining
    socket.on('joinRoom', async (roomId) => {
      console.log(`${user.firstName} joined room ${roomId}`);
      const db = getDb();
      const roomIdObj = new ObjectId(roomId);

      // Fetch room details from the database
      const room = await db.collection('p2p_rooms').findOne({ _id: roomIdObj });
      if (room) {
        socket.join(roomId);

        // Send the current room state to the joining user
        socket.emit('roomState', room);

        // Notify the admin when a viewer joins
        if (!user.isAdmin) {
          console.log(`${user.firstName} is a viewer`);
          socket.to(roomId).emit('userJoined', {
            userId: socket.id,
            userName: user.firstName
          });
        } else {
          console.log(`${user.firstName} is the admin`);
        }

        // Increment guest count in the database
        await db.collection('p2p_rooms').updateOne({ _id: roomIdObj }, { $inc: { guests: 1 } });
      } else {
        console.error(`Room with ID ${roomId} not found`);
        socket.emit('error', 'Room not found');
      }
    });

    // Handle P2P offer from admin to viewer
    socket.on('p2pInit', async (data) => {
      console.log(`Admin ${user.firstName} initialized P2P connection`, data);

      if (user.isAdmin) {
        const db = getDb();
        const roomIdObj = new ObjectId(data._id);

        // Update the room with the offer in the database
        await db.collection('p2p_rooms').updateOne({ _id: roomIdObj }, { $set: { offer: data.offer } });

        // Relay the offer to the viewer
        socket.to(data.peerId).emit('p2pOffer', {
          from: socket.id,
          offer: data.offer
        });
        console.log(`Offer sent to viewer: ${data.peerId}`);
      } else {
        console.error(`Non-admin ${user.firstName} attempted to initiate P2P connection`);
      }
    });

    // Handle P2P answer from viewer to admin
    socket.on('p2pAnswer', async (data) => {
      console.log(`Viewer sent answer to admin:`, data);

      // Relay the answer back to the admin
      socket.to(data.peerId).emit('p2pAnswer', {
        from: socket.id,
        answer: data.answer
      });
    });

    // Handle ICE candidates
    socket.on('p2pCandidate', async (data) => {
      console.log(`Received ICE candidate from ${user.firstName}:`, data.candidate);

      // Relay the ICE candidate to the target peer
      socket.to(data.peerId).emit('p2pCandidate', {
        from: socket.id,
        candidate: data.candidate
      });
    });

    // Handle room deletion (admin only)
    socket.on('deleteRoom', async (roomId) => {
      if (!user.isAdmin) {
        console.error(`Non-admin ${user.firstName} attempted to delete a room`);
        return;
      }

      console.log(`Admin ${user.firstName} is deleting room: ${roomId}`);
      const db = getDb();
      const roomIdObj = new ObjectId(roomId);

      // Remove the room from the database
      await db.collection('p2p_rooms').deleteOne({ _id: roomIdObj });

      // Notify all users in the room
      socket.to(roomId).emit('roomDeleted', { roomId });
      socket.leave(roomId);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`${user.firstName} disconnected from the video stream`);
    });
  }
};
