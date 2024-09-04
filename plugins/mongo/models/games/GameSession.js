//plugins/mongo/models/games/GameSession.js
import ModelHelper from '../../helpers/models.js';
import User from '../User.js'
const modelName = 'gameSession';
import chalk from 'chalk'
export default class GameSession extends ModelHelper {
  constructor(gameSessionData) {
    super(`${modelName}s`);
    this.modelFields = {
      sessionId: { type: 'text', value: null },
      gameId: { type: 'text', value: null },
      gameName: { type: 'text', value: null },
      players: { type: 'array', value: [] },
      startTime: { type: 'date', value: null },
      endTime: { type: 'date', value: null },
      currentState: { type: 'text', value: null },
      turnHistory: { type: 'array', value: [] },
      status: { type: 'text', value: null },
    };
    if (gameSessionData) {
      for (let key in this.modelFields) {
        if (gameSessionData[key] !== undefined) {
          this.modelFields[key].value = gameSessionData[key];
        }
      }
    }
  }

  static getModelFields() {
    return Object.keys(new GameSession().modelFields).map((key) => {
      const field = new GameSession().modelFields[key];
      return { name: key, type: field.type };
    });
  }

  middlewareForCreateRoute() {
    return [];
  }

  middlewareForEditRoute() {
    return [];
  }

  get fileFields() {
    return [];
  }

  async uploadImagesToLinode(req, res, next) {
    next();
  }

  async markUserLast(userId, sessionId) {
    try {
      const update = {
        lastGame: sessionId, // Update user's lastGame field with the session ID
      };
  console.log(chalk.yellow(`update:${update}`))
      const result = await new User().updateById(userId, update); // Await the update operation
  
      // Optional: Log the result to confirm the update
  
      return result; // Return the result of the update operation
  
    } catch (error) {
      return null; // Return null or an appropriate fallback in case of error
    }
  }

async checkForUser(userId) {
  try {
    // Retrieve the user's data by ID
    const user = await new User().getById(userId);
    if (!user) {
      console.error(`User not found with ID: ${userId}`);
      return false;
    }
    console.log(`lastGame Check: ${user.lastGame}`)

    const lastGameId = user.lastGame; // Get the user's lastGame ID

    if (!lastGameId) {
      console.log(`No lastGame found for user ID: ${userId}`);
      return false;
    }

    // Fetch game sessions with the specific statuses and matching lastGame ID
    const sessions = await new GameSession().getAllByIdAndStatus(lastGameId, ["waiting for players", "waiting to start"]);



    // Check if there are any matching sessions
    if (sessions.length > 0) {
      return lastGameId; // Return lastGame if it matches a waiting session
    }

    // No matching session found
    return false;

  } catch (error) {
    console.error('Error checking for user:', error);
    return false;
  }
}


  pathForGetRouteView() {
    return `admin/${modelName}s/template`;
  }
}
