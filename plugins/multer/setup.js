import multer from 'multer';
import path from 'path';
import { resizeAndCropImage } from '../sharp/sharp.js'; // Adjust path as necessary

const { resizeAndCropImage } = require('../sharp/sharp'); // Adjust path as necessary

// Use memory storage to process the image before saving
const storage = multer.memoryStorage();

export const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Not an image! Please upload only images.'), false);
    }
  },
}).single('image'); // 'image' should match the field name in your form

// Middleware to process image after uploading and before saving
export const processImage = (req, res, next) => {
  if (!req.file) {
    return next(new Error('No file uploaded!'));
  }

  // Extract type from request; default to 'general' if not specified
  const type = req.body.type || 'general';
  const originalFilePath = req.file.buffer;
  const outputDirectory = path.join(__dirname, '../../uploads'); // Adjust the path as necessary
  const filename = `${Date.now()}-${req.file.originalname}`;

  // Call the resizeAndCropImage function with the buffer
  resizeAndCropImage(
    originalFilePath,
    outputDirectory,
    filename,
    type,
    req.body.options || {}
  )
    .then((outputPath) => {
      // Replace the file in the request with the processed file info
      req.file.path = outputPath;
      req.file.filename = filename;
      next();
    })
    .catch((error) => {
      next(error);
    });
};
