const canvas = document.getElementById('cardCanvas');
const context = canvas.getContext('2d');
const socket = io();

let gameState = {};

socket.on('updateGameState', (state) => {
  gameState = state;
  render();
});

function render() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  // Draw cards or whatever is needed
}

render();
