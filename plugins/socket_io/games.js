import GameSession from "../mongo/models/games/GameSession.js";
import GameState from "../mongo/models/games/noDb/GameState.js";

export const socketGamesHandlers = {
  onConnection: (nsp, socket, users) => {
    const user = socket.request.user;
    const userName = user.displayName;
    console.log(`GAMES.JS ~ User: ${userName} connected to GAMES`);

    const avatarImage = user.images?.find((img) => img.avatarTag) || {};
    const avatarThumbnailUrl = avatarImage.thumbnailUrl || 'defaultThumbnail.png';

    users[socket.id] = { userName, avatarThumbnailUrl };

    // Join the user to a specific room based on the game session
    socket.on('join game session', async (data) => {
      const { gameSessionId } = data; // Assuming data contains gameSessionId
      socket.join(gameSessionId); // Join the user to the room named after the game session ID

      console.log(`${userName} joined game session: ${gameSessionId}`);
      
      // Update game session with the new player
      await new GameSession().addPlayerToSession(gameSessionId, user._id);

      // Notify other players in the room about the new player
      nsp.to(gameSessionId).emit('player update', {
        userId: user._id,
        userName: userName,
        avatarThumbnailUrl: avatarThumbnailUrl
      });

      // Send session-specific data to the user
      socket.emit('games in session', { gameSessionId });
    });

    socket.on('ready up', async ({ playerId, sessionId, startGame }) => {
      try {
        console.log(`Player ${playerId} is ready for session ${sessionId}`);

        // Mark the player as ready in the game session
        await GameSession.markPlayerReady(sessionId, playerId);

        // Check if all players are ready and the game should start
        const allPlayersReady = await GameSession.areAllPlayersReady(sessionId);
        if (allPlayersReady && startGame) {
          console.log(`Starting game for session ${sessionId}`);
          const result = await new GameState().startGame();
          const updateStatus = { status: "playing", currentState: "running" };
          await GameSession.updateById(sessionId, updateStatus);

          const currentState = await new GameState().getState();
          console.log('Game State:', currentState);

          // Notify all players that the game has started
          nsp.to(sessionId).emit('game started', { gameState: currentState });
        } else {
          // Notify the room that the player is ready
          nsp.to(sessionId).emit('player ready', { playerId });
        }
      } catch (error) {
        console.error(`Error starting game for session ${sessionId}:`, error);
        socket.emit('error', { message: 'Failed to start the game session.' });
      }
    });

    // Handle player updates
    socket.on('players update', (player) => {
      console.log(`games socket route, ${player}`);
      const playerRoom = Object.keys(socket.rooms).find(room => room !== socket.id);
      if (playerRoom) {
        nsp.to(playerRoom).emit('player update', player);
      }
    });

    // Emit a ping to the client every 5 seconds
    const pingInterval = setInterval(() => {
      const startTime = Date.now();
      socket.emit('ping', { startTime, userId: user._id });
    }, 5000);

    socket.on('pong', (data) => {
      const latency = Date.now() - data.startTime; // Calculate the round-trip time (RTT)
      console.log(`Received pong from ${userName} with latency: ${latency} ms`);

      // Emit the ping result back to the specific client to update their DOM
      socket.emit('ping result', { userId: user._id, latency });
    });

    socket.on('disconnect', async () => {
      clearInterval(pingInterval);
      delete users[socket.id];
      console.log(`User ${userName} disconnected`);

      // Notify others in the room that the user has disconnected
      const userRoom = Object.keys(socket.rooms).find(room => room !== socket.id);
      if (userRoom) {
        nsp.to(userRoom).emit('player disconnected', { userId: user._id });

        // Optionally remove player from game session or handle disconnection logic
        await GameSession.removePlayerFromSession(userRoom, user._id);
      }
    });
  },
};
