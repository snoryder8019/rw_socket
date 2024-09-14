import multer from 'multer';

// Your multer config for video storage
const storage = multer.memoryStorage();

// Set file size limit for videos (e.g., 500MB)
const uploadVideo = multer({
  storage: storage,
  limits: { fileSize: 500 * 1024 * 1024 },  // 500 MB limit
});

// Optional processImages middleware (if required for image manipulation)
const processImages = (req, res, next) => {
  if (!req.files || !req.files.thumbnailFile) return next();

  // You can use a library like sharp here to manipulate images
  console.log('Processing images...');
  
  next();
};

export { uploadVideo, processImages };
