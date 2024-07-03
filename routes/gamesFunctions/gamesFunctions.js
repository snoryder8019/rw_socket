const express = require('express')
const router = express.Router()

//Direct game creation endpoint

// Proxy endpoint to remote server
router.post('/create', async (req, res) => {
  try {
    const response = await fetch('https://games.w2marketing.biz/games/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'user-id': req.headers['user-id'], // Forward user-id from client request
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Error fetching from games.w2marketing.biz:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

  
module.exports=router;