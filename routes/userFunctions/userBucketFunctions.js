//routes/userFunctions/userBucketFunctions.js **NOTE GPT: DONT REMOVE THIS LINE**
import express from 'express';
import path from 'path';
import { ObjectId } from 'mongodb';
import { getDb } from '../../plugins/mongo/mongo.js';
import { uploadToLinode, deleteFromLinode } from '../../plugins/aws_sdk/setup.js';
import { upload, processImage } from '../../plugins/multer/setup.js';
import { resizeAndCropImage } from '../../plugins/sharp/sharp.js';
import Image from '../../plugins/mongo/models/Image.js';
import User from '../../plugins/mongo/models/User.js';

const router = express.Router();

// Route to render emojis view
router.get('/getEmojis', async (req, res) => {
  try {
    res.render('forms/emojis');
  } catch (error) {
    console.error('Error rendering emojis:', error);
    res.status(500).send('An error occurred while loading emojis.');
  }
});

// Route to upload user image
router.post('/userImgUpload', upload, processImage, async (req, res) => {
  try {
    const user = req.user;

    const imagePath = req.file.path;
    const fileKey = `rw_users/${user._id}/${req.file.filename}`;
    const fileBuffer = req.file.buffer;

    // Upload image to Linode
    const bucketUrl = await uploadToLinode(imagePath, fileKey);

    // Create and upload thumbnail to Linode
    const thumbnailPath = await resizeAndCropImage(fileBuffer, path.dirname(imagePath), `thumb-${req.file.filename}`, 'thumbnail');
    const thumbFileKey = `rw_users/${user._id}/thumb-${req.file.filename}`;
    const thumbnailUrl = await uploadToLinode(thumbnailPath, thumbFileKey);

    // Prepare the minimal data required for the Image model
    const imageData = {
      name: req.file.filename,
      bucketUrl: bucketUrl,
      thumbnailUrl: thumbnailUrl,
      createdBy: user._id,
      alt: req.body.alt, // If provided, otherwise the default in the model will be used
    };

    // Create a new image entry in the database using the create() method
    const imageResponse = await new Image().create(imageData);

    // Add the new image to the user's images array in the database using pushById()
    const userResponse = await new User().pushById(user._id, {
      images: {
        bucketUrl: imageResponse.bucketUrl,
        thumbnailUrl: imageResponse.thumbnailUrl,
        avatarTag: false,
        // You can add additional fields if needed
      }
    );

    // Log responses for debugging
    console.log(`imageResponse ID: ${imageResponse._id}`);
    console.log(`userResponse acknowledged: ${userResponse.acknowledged}, modifiedCount: ${userResponse.modifiedCount}`);

    req.flash('success', 'Avatar saved to profile.');
    res.redirect('/');
  } catch (error) {
    console.error('Error in userImgUpload endpoint:', error);
    res.render('error', { error: error });
  }
});


// Route to get user images
router.get('/GETUSERIMAGES', async (req, res) => {
  try {
    const user = req.user;

    // Use the Image model to find images by user ID
    const userImages = await new Image().find({ createdBy: user._id });
    res.send({ success: true, images: userImages });
  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  }
});

// Route to delete an image
router.post('/DELETEIMAGE', async (req, res) => {
  try {
    const { imageId } = req.body;
    const user = req.user;

    // Use the Image model to find the image by ID and user ID
    const imageToDelete = await new Image().findOne({ bucketUrl: imageId, createdBy: user._id });

    if (!imageToDelete) {
      return res
        .status(404)
        .send({ success: false, message: 'Image not found.' });
    }

    // Delete the image and thumbnail from Linode
    await deleteFromLinode(imageToDelete.bucketUrl);
    await deleteFromLinode(imageToDelete.thumbnailUrl);

    // Use the Image model to delete the image entry from the database
    await new Image().deleteOne({ _id: imageToDelete._id });

    // Remove the image from the user's images array in the database
    await new User().updateById(user._id, {
      $pull: { images: { bucketUrl: imageId } }
    });

    res.send({ success: true, message: 'Image deleted successfully.' });
  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  }
});

// Route to edit an image (example placeholder)
router.post('/EDITIMAGE', async (req, res) => {
  // Implement edit logic using Image model functions, similar to DELETEIMAGE and USERIMGUPLOAD combined
});

export default router;
