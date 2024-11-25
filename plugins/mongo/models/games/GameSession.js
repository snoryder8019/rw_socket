import ModelHelper from '../../helpers/models.js';
import User from '../User.js';
import chalk from 'chalk';
import GameElement from './GameElement.js'
import GameState from './noDb/GameState.js'

const modelName = 'gameSession';
//status emits to the launcher for the UX/UI 
//terms: waiting fr players, waiting to start, playing, session ended, error
//currentState is the games persistent data, see state terms at GameState()
export default class GameSession extends ModelHelper {
  constructor(gameSessionData) {
    super(`${modelName}s`);
    this.modelFields = {
      sessionId: { type: 'text', value: null },
      gameSettings: { type: 'text', value: null },
      gameId: { type: 'text', value: null },
      gameName: { type: 'text', value: null },
      players: { type: 'array', value: [] },
      startTime: { type: 'date', value: null },
      endTime: { type: 'date', value: null },
      currentState: { type: 'object', value: {} },
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
      const result = await new User().updateById(userId, update); // Await the update operation
      console.log(chalk.yellow(`Marking User update:${result}`));

      // Optional: Log the result to confirm the update
      return result; // Return the result of the update operation
    } catch (error) {
      return null; // Return null or an appropriate fallback in case of error
    }
  }

  async checkForUser(userId) {
    try {
      console.log(`USER IDDDDDD :${userId}`)
      const user = await new User().getById(userId);
      if (!user) {
        console.error(`User not found with ID: ${userId}`);
        return false;
      }
      console.log(`lastGame Check: ${user.lastGame}`);

      const lastGameId = user.lastGame; // Get the user's lastGame ID

      if (!lastGameId) {
        console.log(`No lastGame found for user ID: ${userId}`);
        return false;
      }

      const sessions = await new GameSession().getAllByIdAndStatus(lastGameId, ["waiting for players", "waiting to start","playing"]);
console.log(chalk.yellow(sessions))
      if (sessions.length > 0) {
        return lastGameId; // Return lastGame if it matches a waiting session
      }

      return false; // No matching session found
    } catch (error) {
      console.error('Error checking for user:', error);
      return false;
    }
  }

  pathForGetRouteView() {
    return `admin/${modelName}s/template`;
  }

  // Add a player to a game session
  async addPlayerToSession(userId,sessionId) {
    try {
      console.log(sessionId)
      const session = await new GameSession().getById(sessionId);
      if (!session) {
        console.error(`Session not found with ID: ${sessionId}`);
        return false;
      }
      if (!session.players.includes(userId)) {
        session.players.push(userId);
        await new GameSession().markUserLast(userId,session._id)
        await this.updateById(sessionId, { players: session.players });
        console.log(`User ${userId} added to session ${sessionId}`);
        return true;
      }

      console.log(`User ${userId} is already in session ${sessionId}`);
      return false;
    } catch (error) {
      console.error(`Error adding player to session ${sessionId}:`, error);
      return false;
    }
  }

  // Mark a player as ready in a session
  async markPlayerReady(userId,sessionId) {
    try {
      const session = await new GameSession().getById(sessionId);
      if (!session) {
        console.error(`Session not found with ID: ${sessionId}`);
        return false;
      }

      if (session && session.players && session.players.length > 0) {
        // Use the correct property to find the player by userId
        const playerIndex = session.players.findIndex(player => 
          player.id && player.id.includes(userId)
        );
        
        if (playerIndex !== -1) {
          session.players[playerIndex].ready = true;
          await new GameSession().updateById(sessionId, { players: session.players });
          console.log(`Player ${userId} marked as ready in session ${sessionId}`);
          return true;
        } else {
          console.log(`Player ${userId} not found in session ${sessionId}`);
          return false;
        }
      } else {
        console.log(`Session ${sessionId} not found or contains no players`);
        return false;
      }

    } catch (error) {
      console.error(`Error marking player ready in session ${sessionId}:`, error);
      return false;
    }
  }

  // Check if all players are ready in a session
  async areAllPlayersReady(sessionId) {
    try {
      const session = await new GameSession().getById(sessionId);
      if (!session) {
        console.error(`Session not found with ID: ${sessionId}`);
        return false;
      }

      const allReady = session.players.every(player => player.ready);
      console.log(`All players ready status for session ${sessionId}: ${allReady}`);
      return allReady;
    } catch (error) {
      console.error(`Error checking if all players are ready in session ${sessionId}:`, error);
      return false;
    }
  }

  // Remove a player from a game session
  async removePlayerFromSession(sessionId, userId) {
    try {
      const session = await this.getById(sessionId);
      if (!session) {
        console.error(`Session not found with ID: ${sessionId}`);
        return false;
      }

      const playerIndex = session.players.findIndex(p => p === userId);
      if (playerIndex !== -1) {
        session.players.splice(playerIndex, 1);
        await this.updateById(sessionId, { players: session.players });
        console.log(`User ${userId} removed from session ${sessionId}`);
        return true;
      }

      console.log(`User ${userId} not found in session ${sessionId}`);
      return false;
    } catch (error) {
      console.error(`Error removing player from session ${sessionId}:`, error);
      return false;
    }
  }

}