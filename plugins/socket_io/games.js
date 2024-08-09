const { getDb } = require('../mongo/mongo');
const { ObjectId } = require('mongodb');

const socketGameHandlers = {
  onConnection: (nsp, socket, users) => {
    const user = socket.request.user;
    const userId = user._id;

    console.log(`GAMES.JS ~ User: ${user.firstName} connected to the games namespace`);

    socket.on('joinMatchmaking', async (gameType) => {
      console.log(`User ${user.firstName} is matchmaking for ${gameType}`);

      // Matchmaking logic here: create or join a room
      const roomId = await findOrCreateRoomForGame(gameType, userId);

      socket.join(roomId);
      socket.emit('assignedRoom', roomId);

      const players = await getPlayersInRoom(roomId);
      nsp.to(roomId).emit('updatePlayerList', players);
    });

    socket.on('playerReady', async (data) => {
      const { roomId } = data;
      console.log(`Player ${user.firstName} is ready in room ${roomId}`);
      
      // Mark player as ready
      await markPlayerAsReady(roomId, userId);

      const players = await getPlayersInRoom(roomId);
      nsp.to(roomId).emit('updatePlayerList', players);

      const allReady = players.every(p => p.ready);
      if (allReady) {
        nsp.to(roomId).emit('startGameSession');
      }
    });

    socket.on('disconnect', async () => {
      console.log(`GAMES.JS ~ User: ${user.firstName} disconnected`);
      // Handle player disconnection, e.g., remove them from the room
    });
  }
};

module.exports = socketGameHandlers;
