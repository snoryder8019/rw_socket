const multer = require('multer');
const path = require('path');
const fs = require('fs');


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let dest = './public/cards/';
    if (file.fieldname.startsWith('fonts')) {
      dest = './public/fonts/';
    }
    if (file.fieldname === 'userImg') {
      console.log('userImg condition');
      dest = './public/images/uploads/';
    }
    cb(null, dest);
  },
  filename: function (req, file, cb) {
    if (file.fieldname === 'userImg' && req.user && req.user._id) {
      console.log(file)
      // Use user ID as filename for user image uploads
      const fileExtension = path.extname(file.originalname);
      cb(null, req.user._id + fileExtension);
    } else {
      // For other files, use the original filename
      cb(null, file.originalname);
    }
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 8000000 }, // 1MB
}).fields([
  { name: 'cardFront', maxCount: 1 },
  { name: 'cardBack', maxCount: 1 },
  { name: 'fontName1', maxCount: 1 },
  { name: 'fontName2', maxCount: 1 },
  { name: 'fonts', maxCount: 10 }, // Allow up to 10 font files
  { name: 'userImg', maxCount: 1 }  // User headshot
]);

module.exports = upload;
