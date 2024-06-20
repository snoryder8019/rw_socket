const express = require('express');
const router = express.Router();
const path = require('path')
const upload = require('../../../plugins/multer/setup');
const { getDb } = require('../../../plugins/mongo/mongo');
const { ObjectId } = require('mongodb');
const config = require('../../../config/config'); // Import config if you're using it
const lib = require('../../logFunctions/logFunctions')
const fs = require('fs')
// Route to get a small subset of users with action buttons
router.get('/load', async (req, res) => {
  try {
    const db = getDb();
    const usersCollection = db.collection('users');
    const users = await usersCollection.find({}, { projection: { firstName: 1, lastName: 1, email: 1 } }).limit(10).toArray();

    const userHtml = users.map(user => `
      <div class="user">
      <p>${user.firstName}</p>
        <p> ${user.lastName}</p>
        <p>${user.email}</p>
        <button onclick="editPermissions('${user._id}')">Edit Permissions</button>
      </div>
    `).join('');

    res.send(`
      <html>
        <head>
          <title>Users</title>
          <style>
            .user { margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <h1>Users</h1>
          <input type="text" id="filter" placeholder="Filter by name or email" oninput="filterUsers()">
          <div id="userList">
            ${userHtml}
          </div>
          <div id="permissionsForm"></div>
          <script>
            function filterUsers() {
              const filter = document.getElementById('filter').value.toLowerCase();
              const users = document.querySelectorAll('.user');
              users.forEach(user => {
                const name = user.querySelector('p:nth-child(1)').textContent.toLowerCase();
                const email = user.querySelector('p:nth-child(2)').textContent.toLowerCase();
                if (name.includes(filter) || email.includes(filter)) {
                  user.style.display = '';
                } else {
                  user.style.display = 'none';
                }
              });
            }

            async function editPermissions(userId) {
              try {
                const response = await fetch('/permissions/get/' + userId);
                const data = await response.text();
                document.getElementById('permissionsForm').innerHTML = data;
              } catch (error) {
                console.error('Error fetching permissions:', error);
              }
            }

            async function savePermission(userId) {
              const form = document.querySelector(\`[name="permission_\${userId}"]:checked\`).closest('form');
              const permission = form.querySelector(\`[name="permission_\${userId}"]:checked\`).value;

              try {
                const response = await fetch('/permissions/save', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({ userId, permission })
                });
                if (response.ok) {
                  alert('Permission updated successfully');
                } else {
                  alert('Error updating permission');
                }
              } catch (error) {
                console.error('Error saving permission:', error);
              }
            }
          </script>
        </body>
      </html>
    `);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'An error occurred while fetching user data' });
  }
});

// New endpoint to fetch permissions for a specific user
router.get('/get/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const db = getDb();
    const usersCollection = db.collection('users');
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) }, { projection: { permissions: 1 } });

    if (!user) {
      return res.status(404).send({ error: 'User not found' });
    }

    const permissionsHtml = `
      <div class="permissions">
        <h2>Permissions for ${user.firstName} ${user.lastName}</h2>
        <form>
          <label>
            <input type="radio" name="permission_${user._id}" value="read" ${user.permissions === 'read' ? 'checked' : ''}> Read
          </label>
          <label>
            <input type="radio" name="permission_${user._id}" value="write" ${user.permissions === 'write' ? 'checked' : ''}> Write
          </label>
          <label>
            <input type="radio" name="permission_${user._id}" value="admin" ${user.permissions === 'admin' ? 'checked' : ''}> Admin
          </label>
          <button type="button" onclick="savePermission('${user._id}')">Save</button>
        </form>
      </div>
    `;

    res.send(permissionsHtml);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'An error occurred while fetching user permissions' });
  }
});

// Endpoint to save user permissions
router.post('/save', async (req, res) => {
  try {
    const { userId, permission } = req.body;
    const db = getDb();
    const usersCollection = db.collection('users');
    await usersCollection.updateOne({ _id: new ObjectId(userId) }, { $set: { permissions: permission } });
    res.send({ message: 'Permissions updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'An error occurred while updating user permissions' });
  }
});

module.exports = router;
