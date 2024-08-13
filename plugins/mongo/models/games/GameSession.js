const { ObjectId } = require('mongodb');
const { getDb } = require('../../mongo'); // Assuming you have a getDb function to get your database connection
const ModelHelper = require('../../helpers/models');
const GameRoom = require('./GameRoom')
const modelName = 'gameSession';

class GameSession extends ModelHelper {
  constructor(gameSessionData) {
    super(`${modelName}s`);
    this.modelFields = {
      gameId: { type: 'text', value: null }, // Game ID for identifying the specific game
      gameName: {type: 'text',value: null},
      gameRoom: { type: 'text', value: null }, // Reference to the gameRoom._id
      playerIds: { type: 'array', value: [] }, // Array to store player IDs
      startTime: { type: 'date', value: null }, // Start time of the game session
      endTime: { type: 'date', value: null }, // End time of the game session
      status: { type: 'text', value: null }, // Status of the game session (e.g., 'waiting', 'playing')
      maxPlayers: { type: 'number', value: 4 }, // Ensure maxPlayers is defined, default is 4
    };
    
    // Populate modelFields with data if provided
    if (gameSessionData) {
      for (let key in this.modelFields) {
        if (gameSessionData[key] !== undefined) {
          this.modelFields[key].value = gameSessionData[key];
        }
      }
    }
  }

  // Method to get the path for the game menu view
  pathForGameMenuView() {
    return 'layouts/games/gameMenu'; // Path to the game menu view
  }

  // Static method to get or create a game session based on gameRoom and userId
// Static method to get or create a game session based on gameRoom and userId
static async getGameSession(gameRoomId, userId) {
  const gameSessionModel = new GameSession();
  const { session } = await gameSessionModel.findAvailableSession(gameRoomId, userId);
  return session; // Return the session object directly
}


  // Method to find an available session or create a new one
  async findAvailableSession(gameRoomId, userId) {
    const game = await new GameRoom().getById(gameRoomId);
    const gameSessions = await this.getAll();

    // Ensure userId is treated as an ObjectId
    const userIdObjectId = ObjectId.isValid(userId) ? new ObjectId(userId) : userId;

    // Check if the user is already in a session for this gameRoom
    let sessionWithUser = gameSessions.find(session => 
        session.playerIds.some(playerId => playerId.equals(userIdObjectId))
    );

    if (sessionWithUser) {
        console.log(`User ${userId} is already in session ${sessionWithUser._id}`);
        return { session: sessionWithUser, game };
    }

    // Find an available session with space in the same gameRoom
    let sessionToJoin = gameSessions.find(session => 
        session.gameRoom === gameRoomId && session.playerIds.length < session.maxPlayers
    );

    if (sessionToJoin) {
        console.log(`Adding user ${userId} to session ${sessionToJoin._id}`);
        const updateOperation = { $push: { playerIds: userIdObjectId } };

        const db = getDb();
        await db.collection(`${modelName}s`).updateOne(
            { _id: new ObjectId(sessionToJoin._id) }, 
            updateOperation
        );

        console.log(`User ${userId} added to session ${sessionToJoin._id}`);
        return { session: sessionToJoin, game };
    } else {
        // Create a new session
        const newSession = await this.create({
            gameRoom: gameRoomId,
            gameName: game.name,
            playerIds: [userIdObjectId],
            startTime: new Date(),
            status: 'waiting',
            maxPlayers: game.maxPlayers
        });

        console.log(`Created new session with ID: ${newSession._id}`);
        return { session: newSession, game };
    }
}


  // Static method to get players in a specific game session (room)
// Static method to get players in a specific game session (room)
static async getPlayersInRoom(roomId) {
  const gameSessionModel = new GameSession();

  // Ensure the roomId is an ObjectId before querying
  const roomObjectId = ObjectId.isValid(roomId) ? new ObjectId(roomId) : roomId;

  // Fetch the session by ID
  const session = await gameSessionModel.getById(roomObjectId);
  if (!session) throw new Error('Game session not found');

  // Map playerIds to an array of player details
  return session.playerIds.map(playerId => {
      return {
          id: playerId,
          username: `Player ${playerId}`, // Placeholder username format
          ready: session.status === 'ready' // Check if the session status is 'ready'
      };
  });
}


  // Include any other methods you had here...
}

module.exports = GameSession;
