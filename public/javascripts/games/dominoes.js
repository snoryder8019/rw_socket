
let gameState = {
  tiles: [], // Array to hold the domino tiles
  players: [], // Array to hold player data
  currentPlayer: null, // To track whose turn it is
  board: [], // Array to represent the tiles on the board
};

// Listen for the startGameSession event to initialize the game
socket.on('startGameSession', (data) => {
  gameState = data.gameState; // Update the local gameState with the session state
  renderGame();
});

// Listen for an update to the game state from the server
socket.on('updateGameState', (data) => {
  gameState = data.gameState; // Update the local gameState with the new state
  renderGame();
});

function renderGame() {
  const canvas = document.getElementById('cardCanvas');
  const context = canvas.getContext('2d');

  // Set the canvas background to green
  context.fillStyle = 'green';
  context.fillRect(0, 0, canvas.width, canvas.height);

  // Draw the board tiles
  gameState.board.forEach((tile, index) => {
    drawTile(tile, index, context, false);
  });

  // Draw the current player's hand
  const currentPlayer = gameState.players.find(player => player.id === gameState.currentPlayer);
  currentPlayer.hand.forEach((tile, index) => {
    drawTile(tile, index, context, true);
  });
}

function drawTile(tile, index, context, isPlayerHand) {
  const tileWidth = 60;
  const tileHeight = 30;
  const padding = 10;
  const x = padding + index * (tileWidth + padding);
  const y = isPlayerHand ? canvas.height - tileHeight - padding : padding;

  // Draw rectangle for the tile
  context.fillStyle = 'white';
  context.fillRect(x, y, tileWidth, tileHeight);
  context.strokeRect(x, y, tileWidth, tileHeight);

  // Draw the numbers on the tile
  context.fillStyle = 'black';
  context.font = '20px Arial';
  context.fillText(tile.left, x + 10, y + 20);
  context.fillText(tile.right, x + tileWidth - 20, y + 20);
}

// Handle player actions (like clicking to place a tile)
document.getElementById('cardCanvas').addEventListener('click', (event) => {
  const mouseX = event.clientX - canvas.offsetLeft;
  const mouseY = event.clientY - canvas.offsetTop;
  console.log(`mouseX: ${mouseX}, mouseY: ${mouseY}`);

  // Check if the click is on a player's tile
  const tileIndex = detectTileClick(mouseX, mouseY);
  if (tileIndex !== -1) {
    // Get the clicked tile from the player's hand
    const currentPlayer = gameState.players.find(player => player.id === gameState.currentPlayer);
    const selectedTile = currentPlayer.hand[tileIndex];

    // Send the selected tile to the server to place it on the board
    socket.emit('placeTile', {
      roomId: currentPlayer.roomId, // Add roomId to the game state or session
      tile: selectedTile,
      position: {
        x: mouseX,
        y: mouseY,
      }
    });

    // Remove the tile from the player's hand locally
    currentPlayer.hand.splice(tileIndex, 1);
  }
});

function detectTileClick(mouseX, mouseY) {
  const tileWidth = 60;
  const tileHeight = 30;
  const padding = 10;

  const currentPlayer = gameState.players.find(player => player.id === gameState.currentPlayer);

  for (let i = 0; i < currentPlayer.hand.length; i++) {
    const x = padding + i * (tileWidth + padding);
    const y = canvas.height - tileHeight - padding;

    if (mouseX >= x && mouseX <= x + tileWidth && mouseY >= y && mouseY <= y + tileHeight) {
      return i; // Return the index of the clicked tile
    }
  }

  return -1; // Return -1 if no tile was clicked
}
