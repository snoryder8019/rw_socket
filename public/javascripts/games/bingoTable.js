const canvas = document.getElementById('bingoCanvas');
const context = canvas.getContext('2d');
const socket = io();

let gameState = {};

socket.on('updateGameState', (state) => {
  gameState = state;
  render();
});

function render() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  // Draw Bingo grid or whatever is needed
}

render();
