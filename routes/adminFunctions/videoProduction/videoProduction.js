//routes/adminFunctions/videoProduction/videoProduction.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const { uploadToLinode } = require('../../../plugins/aws_sdk/setup'); // Ensure this path is correct
const Video = require('../../../plugins/mongo/models/Video'); // Model for storing video info

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
    console.log('Uploading video');
    const videoFile = req.file;

    // Upload video to Linode
    const videoKey = `admin/videos/${videoFile.filename}`;
    const videoUrl = await uploadToLinode(videoFile.path, videoKey);

    // Save video info to database
    const videoData = {
      name: videoFile.originalname,
      url: videoUrl
    };

    const video = await Video.create(videoData);
    req.flash('success', `Video: ${videoData.name} uploaded`);
    res.redirect('/');
  } catch (error) {
    console.error(error);
    res.render('error', { error: error });
  }
});

// Route to fetch videos
router.get('/getVideos', async (req, res) => {
  try {
    const videos = await Video.getAll();
    res.status(200).render('admin/videoLead/videoLot', { videos: videos });
  } catch (error) {
    console.error(error);
    res.render('error', { error: error });
  }
});

// New route to handle video broadcast
router.post('/play/broadcastOverlay', (req, res) => {
  const videoUrl = req.body.videoUrl;
  const io = req.app.get('io'); // Retrieve the io instance from the app object
  io.of('/video_production').emit('broadcast overlay', { videoUrl: videoUrl });
  res.status(200).send('Video broadcasted successfully');
});

module.exports = router;
