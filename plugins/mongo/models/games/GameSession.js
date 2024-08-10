// plugins/mongo/models/games/GameSession.js

const { ObjectId } = require('mongodb');
const ModelHelper = require('../../helpers/models');
const modelName = 'gameSession';

class GameSession extends ModelHelper {
  constructor(gameSessionData) {
    super(`${modelName}s`);
    this.modelFields = {
      gameId: { type: 'text', value: null },
      gameRoom: { type: 'text', value: null }, // Reference to the gameRoom._id
      playerIds: { type: 'array', value: [] },
      startTime: { type: 'date', value: null },
      endTime: { type: 'date', value: null },
      status: { type: 'text', value: null },
      maxPlayers: { type: 'number', value: 4 }, // Ensure maxPlayers is defined
    };
    if (gameSessionData) {
      for (let key in this.modelFields) {
        if (gameSessionData[key] !== undefined) {
          this.modelFields[key].value = gameSessionData[key];
        }
      }
    }
  }

  // ... other methods ...

  // Method to get the path for the game menu view
  pathForGameMenuView() {
    return 'layouts/games/gameMenu';
  }

  // Static method to get or create a game session based on gameRoom and userId
  static async getGameSession(gameRoomId, userId) {
    const gameSessionModel = new GameSession();
    return await gameSessionModel.findAvailableSession(gameRoomId, userId);
  }
  async findAvailableSession(gameRoomId, userId) {
    const gameSessions = await this.getAll();

    // Check if the user is already in a session for this gameRoom
    let sessionToJoin = gameSessions.find(session => 
        session.gameRoom === gameRoomId && session.playerIds.includes(userId)
    );

    if (sessionToJoin) {
        // User is already in a session, convert to GameSession instance
        return new GameSession(sessionToJoin);
    }

    // Find an available session with space in the same gameRoom
    sessionToJoin = gameSessions.find(session => 
        session.gameRoom === gameRoomId && session.playerIds.length < session.maxPlayers
    );

    if (sessionToJoin) {
        // Convert to GameSession instance before saving
        sessionToJoin = new GameSession(sessionToJoin);
        console.log(`Adding user ${userId} to session ${sessionToJoin._id}`);
        sessionToJoin.playerIds.push(userId); // Add userId to the session
        await sessionToJoin.save();
    } else {
        // If no session is found, log and create a new session
        console.log(`Creating new session for gameRoom ${gameRoomId} and user ${userId}`);
        sessionToJoin = await this.create({
            gameRoom: gameRoomId,
            playerIds: [userId],
            startTime: new Date(),
            status: 'waiting',
            maxPlayers: 4 // Adjust as needed
        });

        console.log(`Created new session with ID: ${sessionToJoin._id}`);
    }

    return sessionToJoin;
}

  // Static method to get players in a specific game session (room)
  static async getPlayersInRoom(roomId) {
    const gameSessionModel = new GameSession();
    const session = await gameSessionModel.getById(roomId._id);
    if (!session) throw new Error('Game session not found');

    return session.playerIds.map(playerId => {
      return {
        id: playerId,
        username: `Player ${playerId}`,
        ready: session.status === 'ready'
      };
    });
  }
}

module.exports = GameSession;
