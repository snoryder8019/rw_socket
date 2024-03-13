const express = require('express');
const multer = require('multer');
const  {S3Client} = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');
require('dotenv').config();

// Initialize the S3 client for Linode Object Storage
const s3Client = new S3Client({
    region: process.env.LINODE_BUCKET_REGION,
    credentials: {
      accessKeyId: process.env.LINODE_ACCESS_KEY_ID,
      secretAccessKey: process.env.LINODE_SECRET_ACCESS_KEY,
    },
    endpoint: process.env.LINODE_ENDPOINT
  });
  
const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

router.post('/userAvatarUpload', upload.single('avatar'), async (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).send('No file uploaded.');
  }
  
  const uploadParams = {
    Bucket: process.env.LINODE_BUCKET_NAME,
    Key: `uploads/${file.originalname}`,
    Body: file.buffer,
    ACL: 'public-read',
  };

  try {
    const uploadResult = new Upload({
      client: s3Client,
      params: uploadParams,
    });

    await uploadResult.done();
    console.log('Successfully uploaded');
    res.status(200).send('File uploaded successfully');
  } catch (err) {
    console.error('Error uploading data: ', err);
    res.status(500).send('Failed to upload');
  }
});

module.exports = router;
