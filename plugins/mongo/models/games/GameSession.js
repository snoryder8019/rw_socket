import ModelHelper from '../../helpers/models.js';
import User from '../User.js'
const modelName = 'gameSession';

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

async markUserLast(userId, sessionId){
  try{
    const update = {
      lastGame:sessionId
    }
    const result = await new User().updateById(userId,update)
  }
  catch(error){console.error(error)}
}
  async checkForUser(id) {
    try {
      // Retrieve the user's data by ID
      const result = await new User().getById(id);
      const lastGameId = result.lastGame; // Get the user's lastGame ID
  
      // Fetch all game sessions with specific statuses
      const seshWaiting = await new GameSession().getAll({ status: "waiting for players" });
      const seshStart = await new GameSession().getAll({ status: "waiting to start" });
  
      console.log(`seshStart: ${JSON.stringify(seshStart)}, seshWaiting: ${JSON.stringify(seshWaiting)}`);
  
      // Check if lastGame exists in any of the waiting or starting game sessions
      if (lastGameId) {
        // Combine both waiting and starting sessions into one array
        const allSessions = [...seshWaiting, ...seshStart];
  
        // Check if any session's _id matches the lastGame ID
        const isGameInWaitingSessions = allSessions.some(session => session._id.toString() === lastGameId.toString());
  
        if (isGameInWaitingSessions) {
          return lastGameId; // Return lastGame if it matches a waiting session
        }
      }
  
      // Return false if no matching session is found or lastGame is not defined
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
