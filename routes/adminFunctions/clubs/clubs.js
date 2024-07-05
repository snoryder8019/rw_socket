const express = require('express');
const router = express.Router();
const Club = require('../../../plugins/mongo/models/Club');
const { ObjectId } = require('mongodb');

// Route to get a small subset of clubs with action buttons
router.get('/load', async (req, res) => {
  try {
    const clubs = await Club.getAll();
    const clubHtml = clubs.map(club => `
      <div class="user">
        <p>${club.name}</p>
        <p>members: 25</p>
        <button>notify club</button>
        <form action="/clubs/editClub" method="POST">
          <input type="hidden" name="id" value="${club._id}">
          <button type="submit">Edit Club</button>
        </form>
        <form action="/clubs/deleteClub" method="POST">
          <input type="hidden" name="id" value="${club._id}">
          <button type="submit">Delete Club</button>
        </form>
      </div>
    `).join('');

    res.send(`
      <h1>Clubs</h1>
      <div id="userList">
        ${clubHtml}
      </div>

      <h2>Create New Club</h2>
      <h6>Club Name</h6>
      <form action="/clubs/addClub" method="POST">
        <input type="text" name="name">
        <button type="submit">Add Club</button>
      </form>
    `);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'An error occurred while fetching club data' });
  }
});

// Route to add a new club
router.post('/addClub', async (req, res) => {
  try {
    const { name } = req.body;
    const newClub = new Club(name);
    await Club.create(newClub);
    res.render('index', { message: 'New club created!' });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'An error occurred while adding the club' });
  }
});

// Route to delete a club
router.post('/deleteClub', async (req, res) => {
  try {
    const { id } = req.body;
    await Club.deleteById(id);
    res.send('Club deleted!');
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'An error occurred while deleting the club' });
  }
});

// Route to edit a club and render the generalEditor view
router.post('/editClub', async (req, res) => {
  try {
    const { id } = req.body;
    const club = await Club.getById(id);
    if (!club) {
      return res.status(404).send({ error: 'Club not found' });
    }
    res.render('generalEditor', { model: 'Club', data: club });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'An error occurred while fetching the club data' });
  }
});
// Route to update a club
router.post('/updateClub', async (req, res) => {
    try {
      const { id, name, description } = req.body;
      const updatedClub = { name, description };
      await Club.updateById(id, updatedClub);
      req.flash('success_msg', 'Club updated successfully');
      res.redirect('/clubs/load');
    } catch (error) {
      console.error(error);
      req.flash('error_msg', 'An error occurred while updating the club');
      res.redirect('/clubs/load');
    }
  });
  
module.exports = router;
