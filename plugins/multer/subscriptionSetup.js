const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const { resizeAndCropImage } = require('../sharp/sharp'); // Adjust path as necessary

// Use memory storage to process the image before saving
const storage = multer.memoryStorage();

const subscriptionUpload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Not an image! Please upload only images.'), false);
    }
  }
});

const processSubscriptionImage = async (req, res, next) => {
  if (!req.files) {
    return next();
  }

  try {
    const type = req.body.type || 'general';
    const outputDirectory = path.join(__dirname, '../../uploads'); // Adjust the path as necessary

    for (const [key, files] of Object.entries(req.files)) {
      const file = files[0]; // Only handling one file per field for now
      const originalFilePath = file.buffer;
      const filename = `${Date.now()}-${file.originalname}`;

      const outputPath = await resizeAndCropImage(originalFilePath, outputDirectory, filename, type, req.body.options || {});
      req.body[key] = outputPath;
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { subscriptionUpload, processSubscriptionImage };
