//plugins/mongo/models/games/noDb/GameState.js
import GameSession from '../GameSession.js';
export default class GameState {
    constructor() {
      this.state = 'waiting to start'; // initial state of the game
      this.scoreboard = {};         // 
    }
  /////////////
  //////GAMESTATE FUNCTIONS//////









  
  //////END GAMESTATE FUNCTIONS//////
  ///////////
  async startGame() {
    try{
      const sessionId= "";
      const dbStateUpdate = await new GameSession.updateById(sessionId)
      this.state = 'running';      
      console.log('START MEUP!!')
    }
    catch(error){console.error(error)};
    }
  
    pauseGame() {
      this.state = 'paused';

    }
  
    endGame() {
      this.state = 'ended';
    }
  
    getState() {
      return this.state;
    }
  
    updateScoreboard(points) {
      this.scoreboard += points;
    }
  
    getScoreboard() {
      return this.score;
    }
  
    resetGame() {
      this.state = 'initial';
      this.scoreboard = {};
    }
  }
  