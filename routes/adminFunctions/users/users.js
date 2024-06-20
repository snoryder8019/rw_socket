const express = require('express');
const router = express.Router();
const path = require('path')
const upload = require('../../../plugins/multer/setup');
const { getDb } = require('../../../plugins/mongo/mongo');
const { ObjectId } = require('mongodb');
const config = require('../../../config/config'); // Import config if you're using it
const lib = require('../../logFunctions/logFunctions')
const fs = require('fs')
// router.get('/load', (req, res) => {
//   res.send('Users route');
// });

// Route to get a small subset of users with action buttons
router.get('/load', async (req, res) => {
  try {
    const db = getDb();
    const usersCollection = db.collection('users');
    const users = await usersCollection.find({}, { projection: { firstName: 1,lastName:1,email:1, } }).limit(10).toArray();

    const userHtml = users.map(user => `
      <div class="user">
        <p>${user.firstName}</p>
        <p> ${user.lastName}</p>
        <p>${user.email}</p>
        <p><button>contact</button></p>
        <p> <button>edit</button></p>
        </div>
    `).join('');

    res.send(`
      <html>
        <head>
          <title>Users</title>
        </head>
        <body>
          <h1>Users</h1>
          <div id="userList">
          ${userHtml}
          </div>
     <script></script>
        </body>
      </html>
    `);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'An error occurred while fetching user data' });
  }
});

module.exports = router;

  
