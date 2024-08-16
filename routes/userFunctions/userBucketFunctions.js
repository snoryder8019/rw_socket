import express from 'express';
import path from 'path';
import { ObjectId } from 'mongodb';
import { getDb } from '../../plugins/mongo/mongo.js';
import {
  uploadToLinode,
  deleteFromLinode,
} from '../../plugins/aws_sdk/setup.js';
import { upload, processImage } from '../../plugins/multer/setup.js';
import { resizeAndCropImage } from '../../plugins/sharp/sharp.js';

const router = express.Router();

router.post('/userImgUpload', upload, processImage, async (req, res) => {
  try {
    console.log('userImgUpload Endpoint Called');
    const db = getDb();
    const user = req.user;
    const collection = db.collection('users');
    console.log(req.file.filename);
    console.log(req.file.path);

    const imagePath = req.file.path;
    const fileKey = `rw_users_/${user._id}/${req.file.filename}`;
    const fileBuffer = req.file.buffer;
    console.log('Uploading to Linode...');
    const bucketUrl = await uploadToLinode(imagePath, fileKey);

    console.log('Uploaded to Linode:', bucketUrl);

    const thumbnailPath = await resizeAndCropImage(
      fileBuffer,
      path.dirname(imagePath),
      `thumb-${req.file.filename}`,
      'thumbnail'
    );

    console.log('Thumbnail created:', thumbnailPath);

    const thumbFileKey = `rw_users/${user._id}/thumb-${req.file.filename}`;
    const thumbnailUrl = await uploadToLinode(thumbnailPath, thumbFileKey);
    const refUserId = new ObjectId(user._id);
    console.log('Thumbnail uploaded to Linode:', thumbnailUrl);

    await collection.updateOne(
      { _id: refUserId },
      {
        $push: {
          images: {
            bucketUrl: bucketUrl,
            thumbnailUrl: thumbnailUrl,
            alt: '',
            tags: [],
            avatarTag: false,
            backgroundTag: false,
            underReviewTag: false,
            userLockedTag: false,
            userShared: false,
            adminTags: [],
          },
        },
      }
    );

    console.log('MongoDB updated with image and thumbnail URLs.');
    req.flash('success', 'Avatar saved to profile.');
    res.redirect('/');
  } catch (error) {
    console.error('Error in userImgUpload endpoint:', error);
    res.render('error', { error: error });
  }
});

router.get('/GETUSERIMAGES', async (req, res) => {
  try {
    const db = getDb();
    const user = req.user;
    const collection = db.collection('users');
    const userData = await collection.findOne({ _id: ObjectId(user._id) });
    res.send({ success: true, images: userData.images });
  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  }
});

router.post('/DELETEIMAGE', async (req, res) => {
  try {
    const db = getDb();
    const { imageId } = req.body; // Assuming you pass the imageId to delete
    const user = req.user;
    const collection = db.collection('users');

    // Find the image to delete
    const userData = await collection.findOne({ _id: ObjectId(user._id) });
    const imageToDelete = userData.images.find(
      (img) => img.bucketUrl === imageId
    );

    if (!imageToDelete) {
      return res
        .status(404)
        .send({ success: false, message: 'Image not found.' });
    }

    // Delete image and thumbnail from Linode
    await deleteFromLinode(imageToDelete.bucketUrl);
    await deleteFromLinode(imageToDelete.thumbnailUrl);

    // Update user.images in MongoDB
    await collection.updateOne(
      { _id: ObjectId(user._id) },
      {
        $pull: {
          images: { bucketUrl: imageId },
        },
      }
    );

    res.send({ success: true, message: 'Image deleted successfully.' });
  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  }
});

router.post('/EDITIMAGE', async (req, res) => {
  // Implement edit logic, similar to DELETEIMAGE and USERIMGUPLOAD combined
});

export default router;
