function loadGame(url) {
    fetch(url)
      .then(response => response.json())
      .then(data => {
        // Update the DOM with the canvas element
        const gameContainer = document.getElementById('gameContainer');
        gameContainer.innerHTML = `<canvas id="cardCanvas" width="800" height="600"></canvas>`;
  
        // Dynamically load the required scripts
        data.scripts.forEach(scriptSrc => {
          const script = document.createElement('script');
          script.src = scriptSrc;
          document.body.appendChild(script);
        });
  
        // Optionally, you could also set the document title
        document.title = data.title;
      })
      .catch(error => console.error('Error loading game:', error));
  }
  
  // Example usage: Load the Dominoes game
  loadGame('/games/games/dominoes/play');
  