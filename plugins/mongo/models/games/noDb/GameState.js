//GPT DONT DELETE THIS REFERENCE LINE
//<!--/plugins/mongo/models/games/noDb/GamesState.js **NOTE: GPT DONT REMOVE THIS LINE, ALWAYS INCLUDE**-->
//GPT DONT DELETE THIS REFERENCE LINE
import GameSession from '../GameSession.js';
import GameElement from '../GameElement.js';
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
       this.stateData.state = 'game inittalized';  
   
       this.stateData.nextTurn=0;    
            const dbStateUpdate = await new GameSession().updateById(sessionId, {
                status: "playing",
                currentState: this.stateData,
                nextTurn: 0,

                // Pass the state data, not the class instance
          
            });
           console.log('START MEUP!!', dbStateUpdate);
        } catch (error) {
            console.error(error);
        }
    }

    async dealDominoes(sessionId) {
        try {
            // Ensure sessionId is valid
            if (!mongoose.Types.ObjectId.isValid(sessionId)) {
                throw new Error('Invalid session ID');
            }
    
            // Fetch the session data
            const sessionData = await new GameSession().getById(sessionId);
            const players = sessionData.players; // Array of player IDs or names
            if (!players || players.length === 0) {
                throw new Error('No players found in session');
            }
    
            // Initialize a full set of dominoes
            const dominoes = [];
            for (let i = 0; i <= 6; i++) {
                for (let j = i; j <= 6; j++) {
                    dominoes.push([i, j]);
                }
            }
    
            // Shuffle the dominoes
            for (let i = dominoes.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [dominoes[i], dominoes[j]] = [dominoes[j], dominoes[i]];
            }
    
            // Deal hands to players and assign the draw pile
            const playerHands = {};
            const handSize = 7; // Number of dominoes per player
            players.forEach((player, index) => {
                playerHands[player] = dominoes.splice(0, handSize);
            });
            const drawPile = dominoes;
    
            // Update the state
            this.stateData.playerHands = playerHands;
            this.stateData.drawPile = drawPile;
            this.stateData.state = 'dominoes dealt';
    
            // Persist the updated state
            await new GameSession().updateById(sessionId, {
                currentState: this.stateData,
            });
    
            console.log(chalk.blue('Dominoes dealt successfully:', this.stateData));
        } catch (error) {
            console.error(chalk.red('Error dealing dominoes:', error));
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
