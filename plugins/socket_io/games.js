//GPT DONT DELETE THIS REFERENCE LINE
//plugins/socket_io/games.js
//GPT DONT DELETE THIS REFERENCE LINE
import GameSession from "../mongo/models/games/GameSession.js";
import GameState from "../mongo/models/games/noDb/GameState.js";
import chalk from 'chalk';

export const socketGamesHandlers = {
  onConnection: (nsp, socket, users) => {
    const user = socket.request.user;
    const userName = user.displayName;
    
    const avatarImage = user.images?.find((img) => img.avatarTag) || {};
    const avatarThumbnailUrl = avatarImage.thumbnailUrl || 'defaultThumbnail.png';
    const userId = user._id;
    console.log(chalk.green(`GAMES.JS ~ User: ${userName} connected to GAMES`));
    users[socket.id] = { userName, avatarThumbnailUrl };
    // Handle joining the game session
    socket.on('join game session', async (data) => {
      const { gameSessionId } = data;
      console.log(chalk.blue(`Received gameSessionId: ${gameSessionId}`)); // Log the received session ID
          if (!gameSessionId) {
        socket.emit('error', { message: 'No game session ID provided.' });
        return;
      }
          socket.gameSessionId = gameSessionId;
      socket.join(gameSessionId);
            console.log(chalk.blue(`User ${userName} joined session ${gameSessionId}`));
          const gameSession = await new GameSession().addPlayerToSession(userId, gameSessionId);
      if (gameSession) {
        nsp.to(gameSessionId).emit('playerJoined', {
          players: gameSession.players,
          maxPlayers: gameSession.maxPlayers,
        });
      } else {
        socket.emit('error', { message: 'Failed to join game session.' });
      }
    });
    
    // Handle player readiness
    socket.on('ready up', async (userId, gameSessionId) => {
      console.log(chalk.yellow(`Player ${userId} is ready for session ${gameSessionId}`));

      // Mark player as ready
      await new GameSession().markPlayerReady(userId, gameSessionId);

      // Check if all players are ready
      const allPlayersReady = await new GameSession().areAllPlayersReady(gameSessionId);
      if (allPlayersReady) {
        // Update game session state and notify players
        await new GameSession().updateById(gameSessionId, { status: "playing", currentState: { state: "running" } });
        const currentState = await new GameState().startGame(gameSessionId);
        nsp.to(gameSessionId).emit('update state', { gameState: currentState });
      } else {
        // Notify players that a player is ready
        nsp.to(gameSessionId).emit('player ready', { playerId: userId });
      }
    });

    // Handle ping-pong responses to track latency and check game state every 15 pings
    let pongCounter = 0;
    const pingInterval = setInterval(() => {
      const startTime = Date.now();
      socket.emit('ping', { startTime, userId });
    }, 5000);

    socket.on('pong', async (data) => {
      const latency = Date.now() - data.startTime;
      const gameSessionId = data.gameSessionId; // Ensure this is the session ID, not game settings ID
      console.log(`Received pong with gameSessionId: ${gameSessionId}`); // Log for debugging
    
      if (!gameSessionId) {
        console.error('gameSessionId is not available for this socket.');
        return;
      }
    
      // Every 15th pong, check the game state from the database
      if (pongCounter % 3 === 0) {
        const gameState = await new GameState().getState(gameSessionId);
        socket.emit('state update', gameState);
      }
    
      // Send ping result back to the client
      socket.emit('ping result', { userId: socket.request.user._id, latency });
    });
    
    socket.on('requestStateUpdate', async (data) => {
      const { gameSessionId } = data;
    
      if (!gameSessionId) {
        console.error('No gameSessionId provided for state update');
        return;
      }
    
      console.log(`Received request to update game state for session: ${gameSessionId}`);
      
      try {
        const gameState = await new GameState().update(gameSessionId);
        socket.emit('state update', gameState);  // Send updated state back to clients
      } catch (error) {
        console.error('Error updating game state:', error);
        socket.emit('error', { message: 'Failed to update game state' });
      }
    });
    

    // Handle player disconnection
    socket.on('disconnect', async () => {
      clearInterval(pingInterval);
      delete users[socket.id];

      const gameSessionId = socket.gameSessionId;
      if (gameSessionId) {
        console.log(chalk.red(`User ${userName} disconnected from session ${gameSessionId}`));

        // Notify players about the disconnection and remove the player from the session
        nsp.to(gameSessionId).emit('player disconnected', { userId });
        await GameSession.removePlayerFromSession(gameSessionId, userId);
      }
    });
  },
};
