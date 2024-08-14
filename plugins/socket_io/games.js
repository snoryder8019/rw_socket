const GameSession = require('../../plugins/mongo/models/games/GameSession');
const { getDb } = require('../mongo/mongo');

const socketGameHandlers = {
  onConnection: (nsp, socket, users) => {
    const user = socket.request.user;
    const userId = user._id.toString(); // Convert ObjectId to string

    console.log(`GAMES.JS ~ User: ${user.firstName} (ID: ${userId}) connected to the games namespace`);

    socket.on('joinSession', async ({ sessionId, userId }) => {
      try {
        console.log(`join sesh!!`);
        // Logic to add user to the session room, fetch and update player list, etc.
      } catch (error) {
        console.error(`Error joining session ${sessionId}:`, error);
      }
    });

    socket.on('leaveSession', async ({ sessionId, userId }) => {
      try {
        console.log(`leave sesh!!`);
        // Logic to remove user from the session room, update player list, etc.
      } catch (error) {
        console.error(`Error leaving session ${sessionId}:`, error);
      }
    });

    socket.on('startGameSession', async (sessionId) => {
      try {
        console.log(`start Game!!`);
        nsp.to(sessionId).emit('startGameSession');
      } catch (error) {
        console.error(`Error starting session ${sessionId}:`, error);
      }
    });

    socket.on('joinMatchmaking', async (gameId) => {
      console.log('joinMatchmaking event triggered');
      try {
        console.log(`User ${user.firstName} is matchmaking for game ID: ${gameId}`);

        // Find or create a game session and get the roomId (gameSession._id)
        const gameSession = await GameSession.getGameSession(gameId, userId);
        const roomId = gameSession._id.toString();

        console.log(`User ${user.firstName} is assigned to session ID: ${roomId}`);

        // Join the socket room
        socket.join(roomId);
        socket.emit('assignedRoom', roomId);

        // Check if the user is already in the session's players list
        const playerExists = gameSession.players.some(player => player.id === userId);

        if (!playerExists) {
          // Add the player to the session
          const playerData = {
            id: userId,
            username: user.firstName, // Or use displayName if more appropriate
            ready: false,
            avatarUrl: user.images && user.images.find(image => image.avatar === true)?.url
          };

          gameSession.players.push(playerData);

          // Update the session in the database
          const db = getDb();
          await db.collection('gameSessions').updateOne(
            { _id: gameSession._id },
            { $set: { players: gameSession.players } }
          );
        }

        // Get the updated list of players in the room
        const players = gameSession.players.map(player => ({
          id: player.id,
          username: player.username,
          ready: player.ready
        }));

        console.table(players, ['id', 'username', 'ready']);

        // Notify all clients in the room about the updated player list
        nsp.to(roomId).emit('updatePlayerList', players);

      } catch (error) {
        console.error(`Error in joinMatchmaking for ${user.firstName}:`, error);
        socket.emit('error', 'An error occurred during matchmaking.');
      }
    });

    socket.on('playerReady', async ({ roomId }) => {
      console.log(`Player ${user.firstName} is ready in room ${roomId}`);

      try {
        // Mark player as ready
        await GameSession.readyUp(roomId, userId);

        const players = await GameSession.getPlayersInRoom(roomId);
        console.table(players, ['id', 'username', 'ready']);

        nsp.to(roomId).emit('updatePlayerList', players);

        // Check if all players are ready to start the game
        const allReady = players.every(p => p.ready);
        if (allReady) {
          console.log(`All players in room ${roomId} are ready. Starting game...`);
          nsp.to(roomId).emit('startGameSession');
        }

      } catch (error) {
        console.error(`Error marking player ready in room ${roomId}:`, error);
        socket.emit('error', 'An error occurred while marking the player as ready.');
      }
    });

    socket.on('disconnect', async () => {
      console.log(`GAMES.JS ~ User: ${user.firstName} (ID: ${userId}) disconnected`);
      // Logic to handle player disconnection, e.g., remove them from the session
      // Consider removing the player from the session in the database if needed
    });
  }
};

module.exports = socketGameHandlers;
