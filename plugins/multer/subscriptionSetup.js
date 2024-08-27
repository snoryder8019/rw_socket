import multer from 'multer';
import path from 'path';
import sharp from 'sharp';
import fs from 'fs';

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
});

export const processImages = async (req, res, next) => {
  if (!req.files) {
    return next();
  }

  try {
    const outputDirectory = path.dirname('../../uploads');

    for (const [key, files] of Object.entries(req.files)) {
      const file = files[0];
      const filename = `${Date.now()}-${file.originalname}`;
      const outputPath = path.join(outputDirectory, filename);

      if (!fs.existsSync(outputDirectory)) {
        fs.mkdirSync(outputDirectory, { recursive: true });
      }

      await sharp(file.buffer).resize(500).toFile(outputPath);

      file.path = outputPath;
    }

    next();
  } catch (error) {
    next(error);
  }
};
