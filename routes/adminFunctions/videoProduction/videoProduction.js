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
    console.log('Uploading video');
    const videoFile = req.file;

    // Upload video to Linode
    const videoKey = `admin/videos/${videoFile.filename}`;
    const videoUrl = await uploadToLinode(videoFile.path, videoKey);

    // Save video info to database
    const videoData = {
      name: videoFile.originalname,
      url: videoUrl,
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
    const videoHtml = videos
      .map(
        (video) => `
      <div class="video-card">
        <div class="video-title">${video.name}</div>
        <div class="video-upload-date">Uploaded on: ${new Date(video.createdAt).toLocaleString()}</div>
        <button data-video-url="${video.url}" class="emit-viewers btn">Play Video</button>
      </div>
    `
      )
      .join('');

    const html = `
      <style>
        .video_container { margin: 20px; }
        .video-card { margin-bottom: 20px; padding: 10px; border: 1px solid #ccc; }
        .btn { padding: 10px 20px; background-color: #007bff; color: #fff; border: none; cursor: pointer; }
      </style>
      <div class="video_container">
        <h1>Uploaded Videos</h1>
        ${videoHtml}
      </div>
      <script src="/socket.io/socket.io.js"></script>
      <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
      <script>
        document.addEventListener('DOMContentLoaded', function() {
          $('.emit-viewers').on('click', function() {
            const videoUrl = $(this).data('video-url');
            $.ajax({
              type: 'POST',
              url: '/videoProduction/playVideo',
              data: JSON.stringify({ url: videoUrl }),
              contentType: 'application/json',
              success: function(response) {
                console.log('Video play triggered', response);
              },
              error: function(error) {
                console.error('Error playing video', error);
              }
            });
          });
        });
      </script>
    `;
    res.send(html);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error retrieving videos');
  }
});

// Route to handle playing video
router.post('/playVideo', (req, res) => {
  const { url } = req.body;
  // Here you would handle the logic to play the video, e.g., emitting a socket event
  // For demonstration, let's just log it
  console.log('Playing video:', url);

  // Emit socket event to play video
  const io = req.app.get('socketio');
  io.of('/video_production').emit('play video', { url });

  res.status(200).send('Video play triggered');
});

export default router;
