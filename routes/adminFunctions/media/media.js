const express = require('express');
const router = express.Router();
const { uploadToLinode, getVideos, getImageGrid } = require('../../../plugins/aws_sdk/setup');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const upload = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'uploads/'); // Specify the directory where files will be saved temporarily
        },
        filename: function (req, file, cb) {
            cb(null, Date.now() + path.extname(file.originalname)); // Name the file with a timestamp
        }
    }),
    limits: { fileSize: 100 * 1024 * 1024 } // Limit the file size to 100MB
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
        console.error("Error in /upload endpoint:", error);
        res.status(500).json({ success: false, message: 'File upload failed', error: error.message });
    }
});

// GET /adminFunctions/media/videos
// Endpoint to retrieve a list of videos from Linode Object Storage
router.get('/videos', async (req, res) => {
    try {
        const prefix = req.query.prefix || ''; // Optional prefix for filtering
        const videos = await getVideos(prefix);
        res.json({ success: true, videos });
    } catch (error) {
        console.error("Error in /videos endpoint:", error);
        res.status(500).json({ success: false, message: 'Failed to retrieve videos', error: error.message });
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
        console.error("Error in /images endpoint:", error);
        res.status(500).json({ success: false, message: 'Failed to retrieve images', error: error.message });
    }
});

module.exports = router;
