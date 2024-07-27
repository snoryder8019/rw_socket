const express = require('express');
const router = express.Router();
const { getDb } = require('../../../plugins/mongo/mongo'); // Assuming getDb is defined in your db configuration
const { ObjectId } = require('mongodb');

// Create a new room
router.post('/createRoom', async (req, res) => {
  try {
    const db = getDb();
    const { roomName } = req.body;
    const result = await db.collection('p2p_rooms').insertOne({
      name: roomName,
      userCreated: req.user._id,
      established: new Date(),
      guests: 0,
      offerCandidates: {},
      answerCandidates: {}
    });
    const roomId = result.insertedId;
    res.json({ roomId });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create room' });
  }
});

// Join an existing room
router.post('/joinRoom', async (req, res) => {
  try {
    const { roomId } = req.body;
    const db = getDb();
    const roomIdObj = new ObjectId(roomId);
    const room = await db.collection('p2p_rooms').findOne({ "_id": roomIdObj });

    if (room) {
      await db.collection('p2p_rooms').updateOne({ "_id": roomIdObj }, { $inc: { guests: 1 } });
      res.json({ roomId });
    } else {
      res.status(404).json({ error: 'Room not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to join room' });
  }
});

// Delete a room
router.post('/deleteRoom', async (req, res) => {
  try {
    const { roomId } = req.body;
    const db = getDb();
    const roomIdObj = new ObjectId(roomId);
    await db.collection('p2p_rooms').deleteOne({ "_id": roomIdObj });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete room' });
  }
});

module.exports = router;
