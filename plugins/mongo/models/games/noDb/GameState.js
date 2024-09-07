import GameSession from '../GameSession.js';
import mongoose from 'mongoose'; // Add mongoose for ObjectId validation

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
            // Ensure sessionId is a valid ObjectId
            if (!mongoose.Types.ObjectId.isValid(sessionId)) {
                throw new Error('Invalid ID format');
            }

            // Assuming GameState is stored as a data object, not an instance
            const dbStateUpdate = await new GameSession().updateById(sessionId, {
                status: "playing",
                currentState: this.stateData  // Pass the state data, not the class instance
            });
            this.state = 'running';      
            console.log('START MEUP!!', dbStateUpdate);
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
}
