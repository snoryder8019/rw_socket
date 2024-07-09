const express = require('express');
const multer = require('multer');
const path = require('path');
const { uploadToLinode } = require('../../../plugins/aws_sdk/setup'); // Adjust the path as needed
const Video = require('../../../plugins/mongo/models/Video'); // Adjust the path as needed

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/admin/videos');
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Route to handle video upload
router.post('/upload', upload.single('video'), async (req, res) => {
  try {
    const file = req.file;
    const fileKey = `admin/videos/${file.filename}`;
    const url = await uploadToLinode(file.path, fileKey);

    // Save video info to database
    const video = new Video({
      name: file.originalname,
      url: url,
      thumbnail: `${url}-thumbnail` // Assuming thumbnail generation logic
    });
    await video.save();

    res.status(200).send({ video: video });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error uploading video');
  }
});

module.exports = router;
