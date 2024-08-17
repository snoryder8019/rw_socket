// plugins/mongo/models/games/GameSession.js
const { ObjectId } = require('mongodb');
const { getDb } = require('../../mongo'); 
const ModelHelper = require('../../helpers/models');
const { upload, processImages } = require('../../../multer/subscriptionSetup');
const { uploadToLinode } = require('../../../aws_sdk/setup');
const GameRoom = require('./GameRoom');

class GameSession extends ModelHelper {
  constructor(gameSessionData) {
    super('gameSessions'); // Use the pluralized collection name
    this.modelFields = {
      gameId: { type: 'text', value: null }, // Game ID for identifying the specific game
      gameName: { type: 'text', value: null },
      gameRoom: { type: 'text', value: null }, // Reference to the gameRoom._id
      players: { type: 'array', value: [] }, // Array to store player objects
      startTime: { type: 'date', value: null }, // Start time of the game session
      endTime: { type: 'date', value: null }, // End time of the game session
      status: { type: 'text', value: null }, // Status of the game session (e.g., 'waiting', 'playing')
      game: { type: 'object', value: {} }, // Object to store game-specific information
      maxPlayers: { type: 'number', value: 4 }, // Default maxPlayers is 4
      minPlayers: { type: 'number', value: 2 }, // Default minPlayers is 2
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

  static getModelFields() {
    return Object.keys(new GameSession().modelFields).map(key => {
      const field = new GameSession().modelFields[key];
      return { name: key, type: field.type };
    });
  }

  middlewareForCreateRoute() {
    return [upload.fields(this.fileFields), processImages, this.uploadImagesToLinode.bind(this)];
  }

  middlewareForEditRoute() {
    return [upload.fields(this.fileFields), processImages, this.uploadImagesToLinode.bind(this)];
  }

  get fileFields() {
    return [
      { name: 'mediumIcon', maxCount: 1 },
      { name: 'backgroundImg', maxCount: 1 },
      { name: 'horizBkgd', maxCount: 1 }
    ];
  }

  async uploadImagesToLinode(req, res, next) {
    try {
      if (req.files) {
        for (const key in req.files) {
          const file = req.files[key][0];
          const fileKey = `gameSessions/${Date.now()}-${file.originalname}`;
          const url = await uploadToLinode(file.path, fileKey);
          req.body[key] = url; // Save the URL in the request body
        }
      }
      next();
    } catch (error) {
      console.error("Error in uploadImagesToLinode middleware:", error);
      next(error);
    }
  }

  pathForGetRouteView() {
    return 'layouts/games/gameMenu'; // Define your view path here
  }

  // Static method to get or create a game session based on gameRoom and userId
  static async getGameSession(gameRoomId, userId) {
    const gameSessionModel = new GameSession();

    // Retrieve the GameRoom object based on gameRoomId
    const gameRoomModel = new GameRoom();
    const gameRoom = await gameRoomModel.getById(gameRoomId);

    if (!gameRoom) {
      throw new Error(`GameRoom with ID ${gameRoomId} not found`);
    }

    // Retrieve all sessions for the game room
    const gameSessions = await gameSessionModel.getAll({ gameRoom: gameRoomId });

    // Check if a session already exists with the user
    let sessionWithUser = gameSessions.find(session =>
      session.players.some(player => player.id === userId.toString())
    );

    if (sessionWithUser) {
      console.log(`User ${userId} is already in session ${sessionWithUser._id}`);
      return sessionWithUser; // Return the existing session
    }

    // Find an available session with space
    let sessionToJoin = gameSessions.find(session =>
      session.players.length < session.maxPlayers
    );

    if (!sessionToJoin) {
      // Create a new session only if one doesn't exist
      const newSession = await gameSessionModel.create({
        gameRoom: gameRoomId,
        gameName: gameRoom.name, // Use the gameRoom's name
        players: [], // Initialize as an empty array
        startTime: new Date(),
        status: 'waiting',
        maxPlayers: gameRoom.maxPlayers, // Use the actual maxPlayers value from the game room
        minPlayers: gameRoom.minPlayers // Use the actual minPlayers value from the game room
      });
      console.log(`Created new session with ID: ${newSession._id}`);
      sessionToJoin = newSession;
    }

    return sessionToJoin; // Return the session to join or newly created session
  }
// plugins/mongo/models/games/GameSession.js

// Add this method to GameSession class
static async getAllSessions() {
  const db = getDb();
  return db.collection('gameSessions').find({}).toArray(); // Fetch all game sessions
}

  // Static method to get players in a specific game session (room)
  static async getPlayersInRoom(roomId) {
    const gameSessionModel = new GameSession();

    // Ensure the roomId is an ObjectId before querying
    const roomObjectId = ObjectId.isValid(roomId) ? new ObjectId(roomId) : roomId;

    console.log(`Fetching game session with ID: ${roomObjectId}`);

    // Fetch the session by ID
    const session = await gameSessionModel.getById(roomObjectId);

    if (!session) {
        console.error(`No game session found with ID: ${roomObjectId}`);
        throw new Error('Game session not found');
    }

    // Map players to an array of player details
    const players = session.players.map(player => ({
        id: player.id,
        username: player.username || `Player ${player.id}`, // Use a username or placeholder
        ready: player.ready
    }));

    console.log(`Players in room ${roomObjectId}:`, players);

    return players;
}


  // Method to allow a player to leave a session
  static async leaveSession(sessionId, userId) {
    try {
      // Ensure the sessionId is an ObjectId instance
      const sessionObjectId = ObjectId.isValid(sessionId) ? new ObjectId(sessionId) : sessionId;

      // Convert userId to string for comparison
      const userIdString = userId.toString();

      // Create an instance of GameSession
      const gameSessionModel = new GameSession();

      // Use the instance to call getById
      const session = await gameSessionModel.getById(sessionObjectId);
      if (!session) throw new Error('Game session not found');

      // Remove the user from the players array by pulling the player with matching id
      const updateOperation = { $pull: { players: { id: userIdString } } };

      const db = getDb();
      const result = await db.collection('gameSessions').updateOne(
        { _id: sessionObjectId },
        updateOperation
      );

      if (result.modifiedCount === 0) {
        throw new Error('Failed to remove player from the session.');
      }

      console.log(`User ${userId} has left session ${sessionId}`);

      // Additional logic (optional):
      // If the session has no players left, you might want to delete it or update its status
      const updatedSession = await gameSessionModel.getById(sessionObjectId);
      if (updatedSession.players.length === 0) {
        await db.collection('gameSessions').deleteOne({ _id: sessionObjectId });
        console.log(`Session ${sessionId} deleted as it has no remaining players.`);
      }

      return { success: true, message: 'Player successfully left the session.' };
    } catch (error) {
      console.error('Error leaving session:', error);
      return { success: false, message: error.message };
    }
  }

  // Method to mark a player as ready
  static async readyUp(sessionId, userId) {
    try {
      const sessionObjectId = ObjectId.isValid(sessionId) ? new ObjectId(sessionId) : sessionId;

      // Convert userId to string for comparison
      const userIdString = userId.toString();

      // Create an instance of GameSession
      const gameSessionModel = new GameSession();

      // Fetch the session by ID
      const session = await gameSessionModel.getById(sessionObjectId);
      if (!session) throw new Error('Game session not found');

      // Find the player in the session and mark them as ready
      const player = session.players.find(player => player.id === userIdString);
      if (player) {
        player.ready = true;
      } else {
        throw new Error('Player not found in the session');
      }

      // Check if all players are ready
      const allPlayersReady = session.players.every(player => player.ready);

      // Update the session status if all players are ready
      if (allPlayersReady) {
        session.status = 'readyToStart';
      }

      // Save the updated session
      const db = getDb();
      await db.collection('gameSessions').updateOne(
        { _id: sessionObjectId },
        { $set: { players: session.players, status: session.status } }
      );

      console.log(`User ${userIdString} is ready in session ${sessionId}`);

      return { success: true, message: 'Player marked as ready.', session };
    } catch (error) {
      console.error('Error marking player as ready:', error);
      return { success: false, message: error.message };
    }
  }
}

module.exports = GameSession;
