import express from 'express';
import {
  uploadToLinode,
  getVideos,
  //   getDirectories,
  getImageGrid,
} from '../../../plugins/aws_sdk/setup.js';
import multer from 'multer';
import path from 'path';
import Video from '../../../plugins/mongo/models/Video.js';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/'); // Specify the directory where files will be saved temporarily
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname)); // Name the file with a timestamp
    },
  }),
  limits: { fileSize: 100 * 1024 * 1024 }, // Limit the file size to 100MB
});

// POST /adminFunctions/media/upload
// Endpoint to upload a file to Linode Object Storage
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const filePath = req.file.path;
    const fileKey = req.file.filename;

    const fileUrl = await uploadToLinode(filePath, fileKey);

    // Optionally delete the file from the local system after uploading
    fs.unlinkSync(filePath);

    res.json({ success: true, fileUrl });
  } catch (error) {
    console.error('Error in /upload endpoint:', error);
    res.status(500).json({
      success: false,
      message: 'File upload failed',
      error: error.message,
    });
  }
});

// GET /adminFunctions/media/videos
// Endpoint to retrieve a list of videos from Linode Object Storage
router.get('/videos', async (req, res) => {
  try {
    const prefix = req.query.prefix || ''; // Optional prefix for filtering
    const videos = await getVideos(prefix);
    res.send(videos);
  } catch (error) {
    console.error('Error in /videos endpoint:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve videos',
      error: error.message,
    });
  }
});

router.post('/videos/delete', async (req, res) => {
  try {
    const { fileKey } = req.body; // Assuming the video key is passed in the request body

    if (!fileKey) {
      return res
        .status(400)
        .json({ success: false, message: 'No file key provided' });
    }

    // Call the function to delete the video from Linode Object Storage
    await deleteFromLinode(fileKey);

    // Optionally, remove the video from your database if you're tracking them there
    await new Video().deleteById({ key: fileKey });

    res.json({ success: true, message: 'Video deleted successfully' });
  } catch (error) {
    console.error('Error in /videos/delete endpoint:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete video',
      error: error.message,
    });
  }
});

// GET /adminFunctions/media/images
// Endpoint to retrieve a grid of images from Linode Object Storage
router.get('/images', async (req, res) => {
  try {
    const prefix = req.query.prefix || ''; // Optional prefix for filtering
    const imageGrid = await getImageGrid(prefix);
    res.send(imageGrid); // Sending HTML grid as the response
  } catch (error) {
    console.error('Error in /images endpoint:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve images',
      error: error.message,
    });
  }
});
router.get('/images/:directory', async (req, res) => {
  try {
    const directory = req.params.directory;
    const prefix = directory ? `${directory}/` : ''; // Ensure the directory ends with a slash
    const imageGrid = await getImageGrid(prefix);
    res.send(imageGrid); // Sending HTML grid as the response
  } catch (error) {
    console.error('Error in /images/:directory endpoint:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve images',
      error: error.message,
    });
  }
});

router.get('/getDirectories', async (req, res) => {
  try {
    const prefix = req.query.prefix || ''; // Optional prefix for filtering
    const directoriesHtml = await getDirectories(prefix); // Fetch directory links
    res.send(directoriesHtml); // Sending HTML links as the response
  } catch (error) {
    console.error('Error in /getDirectories endpoint:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve directories',
      error: error.message,
    });
  }
});

export default router;
