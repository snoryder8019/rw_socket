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
router.post('/upload', upload.fields([{ name: 'video', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]), async (req, res) => {
  try {
    console.log('Uploading video and thumbnail');
    const videoFile = req.files['video'][0];
   // const thumbnailFile = req.files['thumbnail'][0];

    // Upload video to Linode
    const videoKey = `admin/videos/${videoFile.filename}`;
    const videoUrl = await uploadToLinode(videoFile.path, videoKey);

    // Upload thumbnail to Linode
   // const thumbnailKey = `admin/thumbnails/${thumbnailFile.filename}`;
   // const thumbnailUrl = await uploadToLinode(thumbnailFile.path, thumbnailKey);

    // Save video info to database
    const videoData = {
      name: videoFile.originalname,
      url: videoUrl,
    //  thumbnail: thumbnailUrl // Add the thumbnail URL
    };

    const video = await Video.create(videoData); // Save using ModelHelper
    req.flash('success',`video : ${videoData.name} uploaded`)
   res.redirect('/')
    // res.status(200).send({ video: video });
  } catch (error) {
    console.error(error);
    res.render('error', { error: error });
  }
});

// Route to fetch videos
router.get('/getVideos', async (req, res) => {
  try {
    const videos = await Video.getAll();
    res.status(200).render('admin/videoLead/videoLot',{ videos: videos });
  } catch (error) {
    console.error(error);
    res.render('error', { error: error });
  }
});

module.exports = router;
