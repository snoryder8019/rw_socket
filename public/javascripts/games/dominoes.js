const canvas = document.getElementById('cardCanvas');
const context = canvas.getContext('2d');
const socket = io();

let gameState = {
  tiles: [], // Array to hold the domino tiles
  players: [], // Array to hold player data
  currentPlayer: null, // To track whose turn it is
  board: [], // Array to represent the tiles on the board
};

// Example of initializing the game with tiles and players
function initializeGame() {
  // Create domino tiles (0-6)
  for (let i = 0; i <= 6; i++) {
    for (let j = i; j <= 6; j++) {
      gameState.tiles.push({ left: i, right: j });
    }
  }

  // Shuffle the tiles (basic shuffle algorithm)
  gameState.tiles.sort(() => Math.random() - 0.5);

  // Distribute tiles to players
  const playerCount = 2; // For example, a two-player game
  const tilesPerPlayer = 7;

  for (let p = 0; p < playerCount; p++) {
    gameState.players[p] = {
      id: p + 1,
      hand: gameState.tiles.splice(0, tilesPerPlayer),
    };
  }

  // Set the first player
  gameState.currentPlayer = gameState.players[0];
}

// Render the game board
function render() {
  context.clearRect(0, 0, canvas.width, canvas.height);

  // Draw the board
  gameState.board.forEach((tile, index) => {
    drawTile(tile, index);
  });

  // Draw the player's hand (just the current player for now)
  const playerHand = gameState.currentPlayer.hand;
  playerHand.forEach((tile, index) => {
    drawTile(tile, index, true);
  });
}

// Function to draw a domino tile
function drawTile(tile, index, isPlayerHand = false) {
  const tileWidth = 60;
  const tileHeight = 30;
  const padding = 10;
  const x = isPlayerHand
    ? padding + index * (tileWidth + padding)
    : padding + index * (tileWidth + padding);
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

// Handle click events to place a tile on the board
canvas.addEventListener('click', (event) => {
  const mouseX = event.clientX - canvas.offsetLeft;
  const mouseY = event.clientY - canvas.offsetTop;

  // Logic to determine if a tile is clicked and where to place it on the board
  // This part of the logic can be expanded based on the rules of the game
});

// Initialize the game and start rendering
initializeGame();
render();
