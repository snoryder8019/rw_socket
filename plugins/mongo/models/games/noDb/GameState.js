export default class GameState {
    constructor() {
      this.state = 'initial'; // initial state of the game
      this.score = 0;         // initial score
    }
  
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
  
    updateScore(points) {
      this.score += points;
    }
  
    getScore() {
      return this.score;
    }
  
    resetGame() {
      this.state = 'initial';
      this.score = 0;
    }
  }
  