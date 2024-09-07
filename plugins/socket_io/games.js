import GameSession from "../mongo/models/games/GameSession.js";
import GameState from "../mongo/models/games/noDb/GameState.js";
import chalk from 'chalk';

export const socketGamesHandlers = {
  onConnection: (nsp, socket, users) => {
    const user = socket.request.user;
    const userName = user.displayName;
    const userId = user._id;

    console.log(chalk.green(`GAMES.JS ~ User: ${userName} connected to GAMES`));

    const avatarImage = user.images?.find((img) => img.avatarTag) || {};
    const avatarThumbnailUrl = avatarImage.thumbnailUrl || 'defaultThumbnail.png';

    users[socket.id] = { userName, avatarThumbnailUrl };

    // Join the user to a specific room based on the game session
    socket.on('join game session', async (data) => {
      const { gameSessionId } = data; // gameSessionId comes from the client
      socket.join(gameSessionId); // Join the room by game session ID
      console.log(`${userName} joined game session: ${gameSessionId}`);

      // Add player to game session and emit player update to all in the room
      const gameSession = await new GameSession().addPlayerToSession(userId, gameSessionId);
      if (gameSession) {
        nsp.to(gameSessionId).emit('player update', {
          userId: user._id,
          userName,
          avatarThumbnailUrl,
        });

        socket.emit('games in session', { gameSessionId });
      } else {
        socket.emit('error', { message: 'Failed to join game session.' });
      }
    });

    // Handle when a player is ready
    socket.on('ready up', async (userObj, gameSessionId) => {
      console.log(chalk.yellow(`Player ${userId} is ready for session ${gameSessionId}`));

      try {
        // Mark player as ready and check if all players are ready
        await new GameSession().markPlayerReady(userId, gameSessionId);
        const allPlayersReady = await new GameSession().areAllPlayersReady(gameSessionId);

        if (allPlayersReady) {
          console.log(`Starting game for session ${gameSessionId}`);
          const updateStatus = { status: "playing", currentState: "running" };
          await new GameSession().updateById(gameSessionId, updateStatus);

          const currentState = await new GameState().startGame();
          nsp.to(gameSessionId).emit('update state', { gameState: currentState });
        } else {
          // Notify the room that this player is ready
          nsp.to(gameSessionId).emit('player ready', { playerId: userId });
        }
      } catch (error) {
        console.error(`Error starting game for session ${gameSessionId}:`, error);
        socket.emit('error', { message: 'Failed to start the game session.' });
      }
    });

    // Update the state when a player action happens
    socket.on('update state', (player) => {
      console.log(`Player ${player.playerId} updated their state.`);
      const playerRoom = Object.keys(socket.rooms).find(room => room !== socket.id);
      if (playerRoom) {
        nsp.to(playerRoom).emit('player update', player);
      }
    });

    // Handle player joining and check if all are ready
    socket.on('playerJoined', async (playerData) => {
      const gameSession = await new GameSession().getById(playerData.gameSessionId);
      gameSession.players.push(playerData);

      // Notify all players about the new join
      nsp.to(playerData.gameSessionId).emit('playerJoined', {
        players: gameSession.players,
        maxPlayers: gameSession.maxPlayers,
      });

      if (gameSession.players.length === gameSession.maxPlayers) {
        nsp.to(playerData.gameSessionId).emit('allPlayersReady');
      }
    });

    // Emit ping to client every 5 seconds
    const pingInterval = setInterval(() => {
      const startTime = Date.now();
      socket.emit('ping', { startTime, userId });
    }, 5000);

    socket.on('pong', (data) => {
      const latency = Date.now() - data.startTime;
      console.log(`Received pong with latency: ${latency} ms`);

      // Emit the ping result back to the specific client
      socket.emit('ping result', { userId, latency });
    });

    // Handle disconnection
    socket.on('disconnect', async () => {
      clearInterval(pingInterval);
      delete users[socket.id];
      console.log(chalk.red(`User ${userName} disconnected`));

      const userRoom = Object.keys(socket.rooms).find(room => room !== socket.id);
      if (userRoom) {
        nsp.to(userRoom).emit('player disconnected', { userId });

        // Remove player from session
        await GameSession.removePlayerFromSession(userRoom, userId);
      }
    });
  },
};
