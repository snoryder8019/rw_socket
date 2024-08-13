const GameSession = require('../../plugins/mongo/models/games/GameSession');

const socketGameHandlers = {
  onConnection: (nsp, socket, users) => {
    const user = socket.request.user;
    const userId = user._id;

    console.log(`GAMES.JS ~ User: ${user.firstName} (ID: ${userId}) connected to the games namespace`);


    socket.on('joinSession', async ({ sessionId, userId }) => {
      try {
        // Logic to add user to the session room, fetch and update player list, etc.
      } catch (error) {
        console.error(`Error joining session ${sessionId}:`, error);
      }
    });
    
    socket.on('leaveSession', async ({ sessionId, userId }) => {
      try {
        // Logic to remove user from the session room, update player list, etc.
      } catch (error) {
        console.error(`Error leaving session ${sessionId}:`, error);
      }
    });
    
    socket.on('startGameSession', async (sessionId) => {
      try {
        // Logic to handle starting the game session
        nsp.to(sessionId).emit('startGameSession');
      } catch (error) {
        console.error(`Error starting session ${sessionId}:`, error);
      }
    });
    





    socket.on('joinMatchmaking', async (gameId) => {
      try {
        console.log(`User ${user.firstName} is matchmaking for game ID: ${gameId}`);
        
        // Find or create a game session and get the roomId (gameSession._id)
        const gameSession = await GameSession.getGameSession(gameId, userId);
        const roomId = gameSession._id.toString();

        console.log(`User ${user.firstName} is assigned to session ID: ${roomId}`);

        // Join the socket room
        socket.join(roomId);
        socket.emit('assignedRoom', roomId);

        // Get the updated list of players in the room
        const players = await GameSession.getPlayersInRoom(gameSession._id);

        console.table(players, ['id', 'username', 'ready']);

        // Notify all clients in the room about the updated player list
        nsp.to(roomId).emit('updatePlayerList', players);

      } catch (error) {
        console.error(`Error in joinMatchmaking for ${user.firstName}:`, error);
        socket.emit('error', 'An error occurred during matchmaking.');
      }
    });

    socket.on('startGameSession', async (roomId) => {
      try {
        console.log(`Starting game session for room ID: ${roomId}`);

        // Notify all clients in the room to update the gameMenu
        const players = await GameSession.getPlayersInRoom(roomId);

        nsp.to(roomId).emit('updateGameMenu', {
          roomId: roomId,
          gameState: 'started', // or whatever state the game is in
          players: players // pass current players or any relevant data
        });

      } catch (error) {
        console.error(`Error starting game session in room ${roomId}:`, error);
        socket.emit('error', 'An error occurred while starting the game session.');
      }
    });

    socket.on('playerReady', async (data) => {
      const { roomId } = data;
      console.log(`Player ${user.firstName} is ready in room ${roomId}`);
      
      try {
        // Mark player as ready
        await markPlayerAsReady(roomId, userId);

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
      // Handle player disconnection, e.g., remove them from the room
      // Optionally, you can add logic to remove the user from the session or handle reconnections
    });
  }
};

module.exports = socketGameHandlers;
