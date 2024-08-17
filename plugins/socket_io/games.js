const GameSession = require('../../plugins/mongo/models/games/GameSession');
const { getDb } = require('../mongo/mongo');

const socketGameHandlers = {
  onConnection: (nsp, socket, users) => {
    const user = socket.request.user;
    const userId = user._id.toString(); // Convert ObjectId to string

    console.log(`GAMES.JS ~ User: ${user.firstName} (ID: ${userId}) connected to the games namespace`);

    async function updatePlayerList(roomId) {
      const players = await GameSession.getPlayersInRoom(roomId);
      console.table(players, ['id', 'username', 'ready']);
      nsp.to(roomId).emit('updatePlayerList', players);
    }

    socket.on('joinSession', async ({ sessionId }) => {
      try {
        console.log(`User ${user.firstName} is joining session ${sessionId}`);
        socket.join(sessionId);
        updatePlayerList(sessionId);
      } catch (error) {
        console.error(`Error joining session ${sessionId}:`, error);
      }
    });

    socket.on('leaveSession', async ({ sessionId }) => {
      try {
        console.log(`User ${user.firstName} is leaving session ${sessionId}`);
        await GameSession.leaveSession(sessionId, userId);
        socket.leave(sessionId);
        updatePlayerList(sessionId);
      } catch (error) {
        console.error(`Error leaving session ${sessionId}:`, error);
      }
    });

    socket.on('startGameSession', async (sessionId) => {
      try {
        console.log(`Starting game session ${sessionId}`);
        nsp.to(sessionId).emit('startGameSession');
      } catch (error) {
        console.error(`Error starting session ${sessionId}:`, error);
      }
    });

    socket.on('joinMatchmaking', async (gameId) => {
      console.log('joinMatchmaking event triggered');
      try {
        console.log(`User ${user.firstName} is matchmaking for game ID: ${gameId}`);

        const gameSession = await GameSession.getGameSession(gameId, userId);
        const roomId = gameSession._id.toString();

        console.log(`User ${user.firstName} is assigned to session ID: ${roomId}`);

        socket.join(roomId);

        const playerExists = gameSession.players.some(player => player.id === userId);

        if (!playerExists) {
          const playerData = {
            id: userId,
            username: user.firstName,
            ready: false,
            avatarUrl: user.images && user.images.find(image => image.avatar === true)?.url
          };

          gameSession.players.push(playerData);

          const db = getDb();
          await db.collection('gameSessions').updateOne(
            { _id: gameSession._id },
            { $set: { players: gameSession.players } }
          );
        }

        socket.emit('assignedRoom', roomId);
      //  updatePlayerList(roomId);
        
      } catch (error) {
        console.error(`GAMES.JS ~ Error in joinMatchmaking for ${user.firstName}:`, error);
        socket.emit('error', 'An error occurred during matchmaking.');
      }
    });
    
    socket.on('playerReady', async ({ roomId }) => {
      console.log(`Player ${user.firstName} is ready in room ${roomId}`);
    //  updatePlayerList(roomId);

      try {
        await GameSession.readyUp(roomId, userId);
     //   updatePlayerList(roomId);

        const players = await GameSession.getPlayersInRoom(roomId);
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
      
      try {
        const sessions = await GameSession.getAllSessions(); // Use the new method
        const session = sessions.find(session => session.players.some(player => player.id === userId));
    
        if (session) {
          await GameSession.leaveSession(session._id, userId);
          socket.leave(session._id.toString());
          updatePlayerList(session._id.toString());
        }
      } catch (error) {
        console.error(`Error during disconnect handling for user ${userId}:`, error);
      }
    });
    


    socket.on('playerMove', (moveData) => {
      // Update gameState based on the move
      gameState.board.push(moveData.tile);
      gameState.currentPlayer = getNextPlayer(gameState.currentPlayer);
    
      // Broadcast the updated gameState to all players in the room
      nsp.to(roomId).emit('updateGameState', { gameState });
    });
    

  }
};

module.exports = socketGameHandlers;
