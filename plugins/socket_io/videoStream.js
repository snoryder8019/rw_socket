import { getDb } from '../../plugins/mongo/mongo.js';
import { ObjectId } from 'mongodb';

export const socketP2PHandlers = {
  onConnection: (nsp, socket, users) => {
    const user = socket.request.user;
    const userId = user._id;

    console.log(
      `VIDEOSTREAM.JS ~ User: ${user.firstName} connected to videoStream`
    );

    // Emit activity to the marquee
    const emitActivity = (message) => {
      nsp.emit('marquee', message);
    };

    socket.on('joinRoom', async (roomId) => {
      console.log(
        `VIDEOSTREAM.JS ~ User: ${user.firstName} joined room ${roomId}`
      );
      const db = getDb();
      const roomIdObj = new ObjectId(roomId);

      // Fetch the room details
      const room = await db.collection('p2p_rooms').findOne({ _id: roomIdObj });
      if (room) {
        // Send the current room state to the new user
        socket.emit('roomState', room);

        // Notify other users in the room
        socket
          .to(roomId)
          .emit('userJoined', { userId: socket.id, userName: user.firstName });

        // Add the user to the room
        socket.join(roomId);

        // Update the guest count
        await db
          .collection('p2p_rooms')
          .updateOne({ _id: roomIdObj }, { $inc: { guests: 1 } });
      } else {
        socket.emit('error', 'Room not found');
      }
    });

    socket.on('p2pInit', async (data) => {
      try {
        // console.log(`VIDEOSTREAM.JS ~ User: ${user.firstName} initiated P2P connection`);
        const db = getDb();
        const roomIdObj = new ObjectId(data._id);
        await db
          .collection('p2p_rooms')
          .updateOne({ _id: roomIdObj }, { $set: { offer: data.offer } });
        socket.to(data.peerId).emit('p2pOffer', {
          from: socket.id,
          offer: data.offer,
        });
        emitActivity(`${user.firstName} initiated a video chat session.`);
      } catch (error) {
        console.error('Error in p2pInit:', error);
      }
    });

    socket.on('p2pAnswer', async (data) => {
      try {
        //  console.log(`VIDEOSTREAM.JS ~ User: ${user.firstName} answered P2P connection`);
        const db = getDb();
        const roomIdObj = new ObjectId(data._id);
        await db
          .collection('p2p_rooms')
          .updateOne({ _id: roomIdObj }, { $set: { answer: data.answer } });
        socket.to(data.peerId).emit('p2pAnswer', {
          from: socket.id,
          answer: data.answer,
        });
        emitActivity(`Hi ${user.firstName}, welcome to the stream.`);
      } catch (error) {
        console.error('Error in p2pAnswer:', error);
      }
    });

    socket.on('p2pCandidate', async (data) => {
      try {
        console.log(
          `VIDEOSTREAM.JS ~ User: ${user.firstName} sent ICE candidate`
        );
        const db = getDb();
        const roomIdObj = new ObjectId(data._id);
        await db
          .collection('p2p_rooms')
          .updateOne(
            { _id: roomIdObj },
            { $push: { candidates: data.candidate } }
          );
        socket.to(data.peerId).emit('p2pCandidate', {
          from: socket.id,
          candidate: data.candidate,
        });
        //   emitActivity(`${user.firstName} sent an ICE candidate.`);
      } catch (error) {
        console.error('Error in p2pCandidate:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log(`VIDEOSTREAM.JS ~ User: ${user.firstName} disconnected`);
      emitActivity(`${user.firstName} disconnected.`);
    });
  },
};
