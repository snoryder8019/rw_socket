const { getDb } = require('../mongo/mongo');
const { ObjectId } = require('mongodb');

const socketGameHandlers = {
  onConnection: (nsp, socket, users) => {
    const user = socket.request.user;
    const userId = user._id;

    console.log(`GAMES.JS ~ User: ${user.firstName} connected to the games namespace`);

    const emitActivity = (message) => {
      nsp.emit('marquee', message);
    };

    socket.on('joinGameRoom', async (roomId) => {
      console.log(`GAMES.JS ~ User: ${user.firstName} joined game room ${roomId}`);
      const db = getDb();
      const roomIdObj = new ObjectId(roomId);

      const room = await db.collection('game_rooms').findOne({ "_id": roomIdObj });
      if (room) {
        socket.emit('roomState', room);
        socket.to(roomId).emit('userJoined', { userId: socket.id, userName: user.firstName });
        socket.join(roomId);
        await db.collection('game_rooms').updateOne({ "_id": roomIdObj }, { $inc: { guests: 1 } });
      } else {
        socket.emit('error', 'Game room not found');
      }
    });

    socket.on('gameMove', async (data) => {
      try {
        const db = getDb();
        const roomIdObj = new ObjectId(data.roomId);

        await db.collection('game_rooms').updateOne(
          { "_id": roomIdObj },
          { $push: { moves: data.move } }
        );

        socket.to(data.roomId).emit('newMove', {
          from: socket.id,
          move: data.move
        });

        emitActivity(`${user.firstName} made a move.`);
      } catch (error) {
        console.error('Error in gameMove:', error);
      }
    });

    socket.on('playerReady', async (data) => {
      try {
        const db = getDb();
        const roomIdObj = new ObjectId(data.roomId);

        await db.collection('game_rooms').updateOne(
          { "_id": roomIdObj },
          { $set: { [`players.${socket.id}.ready`]: true } }
        );

        const room = await db.collection('game_rooms').findOne({ "_id": roomIdObj });
        const allReady = Object.values(room.players).every(player => player.ready);

        if (allReady) {
          nsp.to(roomIdObj).emit('startGame');
        }

        emitActivity(`${user.firstName} is ready.`);
      } catch (error) {
        console.error('Error in playerReady:', error);
      }
    });

    socket.on('disconnect', async () => {
      console.log(`GAMES.JS ~ User: ${user.firstName} disconnected`);

      const db = getDb();
      const room = await db.collection('game_rooms').findOne({ "players._id": socket.id });

      if (room) {
        await db.collection('game_rooms').updateOne(
          { "_id": room._id },
          { $unset: { [`players.${socket.id}`]: "" } }
        );

        socket.to(room._id).emit('userLeft', { userId: socket.id });
      }

      emitActivity(`${user.firstName} disconnected.`);
    });
  }
};

module.exports = socketGameHandlers;
