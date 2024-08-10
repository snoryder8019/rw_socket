const  GameSession  = require('../../plugins/mongo/models/games/GameSession');

const socketGameHandlers = {
  onConnection: (nsp, socket, users) => {
    const user = socket.request.user;
    const userId = user._id;

    console.log(`GAMES.JS ~ User: ${user.firstName} connected to the games namespace`);
    socket.on('joinMatchmaking', async (gameId) => {
      try {
        console.log(`User ${user.firstName} is matchmaking for game ID: ${gameId}`);
    
        // Find or create a game session and get the roomId
        const roomId = await GameSession.getGameSession(gameId, user._id);
    
        // Join the socket room
        socket.join(roomId);
        socket.emit('assignedRoom', roomId);
    
        // Get the updated list of players in the room
        const players = await GameSession.getPlayersInRoom(roomId);
    
        // Notify all clients in the room about the updated player list
        nsp.to(roomId).emit('updatePlayerList', players);
    
      } catch (error) {
        console.error(`Error in joinMatchmaking for ${user.firstName}:`, error);
        socket.emit('error', 'An error occurred during matchmaking.');
      }
    });
    // On the server side (e.g., games.js)

socket.on('startGameSession', () => {
  // Notify all clients in the room to update the gameMenu
  nsp.to(roomId).emit('updateGameMenu', {
    roomId: roomId,
    gameState: 'started', // or whatever state the game is in
    players: currentPlayers // pass current players or any relevant data
  });
});

    socket.on('playerReady', async (data) => {
      const { roomId } = data;
      console.log(`Player ${user.firstName} is ready in room ${roomId}`);
      
      // Mark player as ready
      await markPlayerAsReady(roomId, userId);

      const players = await GameSession.getPlayersInRoom(roomId);
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
