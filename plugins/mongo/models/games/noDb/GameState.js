//plugins/mongo/models/games/noDb/GameState.js
export default class GameState {
    constructor() {
      this.state = 'waiting to start'; // initial state of the game
      this.scoreboard = {};         // 
    }
  /////////////
  //////GAMESTATE FUNCTIONS//////









  
  //////END GAMESTATE FUNCTIONS//////
  ///////////
    startGame() {
      this.state = 'running';
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
  