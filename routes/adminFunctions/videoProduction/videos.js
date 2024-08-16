import express from 'express';
import multer from 'multer';
import path from 'path';
import { uploadToLinode } from '../../../plugins/aws_sdk/setup.js'; // Ensure this path is correct
import Video from '../../../plugins/mongo/models/Video.js'; // Model for storing video info

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/admin/videos');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
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
      thumbnail: `${url}-thumbnail`, // Assuming thumbnail generation logic
    });
    await video.save();

    res.status(200).send({ video: video });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error uploading video');
  }
});

export default router;
