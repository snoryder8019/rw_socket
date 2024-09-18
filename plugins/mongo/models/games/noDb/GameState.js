//<!--/plugins/mongo/models/games/noDb/GamesState.js **NOTE: GPT DONT REMOVE THIS LINE, ALWAYS INCLUDE**-->

import GameSession from '../GameSession.js';
import mongoose from 'mongoose'; // Add mongoose for ObjectId validation
import { ObjectId } from 'mongodb';
import chalk from 'chalk';
export default class GameState {
    constructor(stateData) {
      const gameStatePacket = {
        state: 'waiting to start',
        scoreboard: {},         
        currentTurn: null,
        nextTurn: null,
        playerHands: {},
        board: {},
        drawPile: {},
        discardPile: {},
        turnCount: 0,
        gameWinner: null
      };
      this.stateData = stateData || gameStatePacket;  // Default state packet if none provided
    }

    ////// GAMESTATE FUNCTIONS //////

    async startGame(sessionId) {
        try {
       console.log(sessionId)
       this.stateData.state = 'dealing';  
       this.stateData.nextTurn=0;    
            const dbStateUpdate = await new GameSession().updateById(sessionId, {
                status: "playing",
                currentState: this.stateData  // Pass the state data, not the class instance
            });
           // console.log('START MEUP!!', dbStateUpdate);
        } catch (error) {
            console.error(error);
        }
    }

    pauseGame() {
        this.state = 'paused';
    }

    endGame() {
        this.state = 'ended';
    }

    async getState(sessionId) {
        try {
            // Ensure sessionId is valid before querying
            if (!mongoose.Types.ObjectId.isValid(sessionId)) {
                throw new Error('Invalid ID format');
            }
console.log(chalk.green(sessionId))
            const persistentStateData = await new GameSession().getById(sessionId);
            return persistentStateData.currentState;
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    updateScoreboard(points) {
        this.scoreboard += points;
    }

    getScoreboard() {
        return this.scoreboard;
    }

    resetGame() {
        this.state = 'initial';
        this.scoreboard = {};
    }
    async update(gameSessionId) {
        console.log(`Updating game state for session: ${gameSessionId}`);
        // Logic to update the game state for the specific session
        // Fetch data, update state, etc.
        return updatedGameState;
      }
}
