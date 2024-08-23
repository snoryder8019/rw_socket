const express = require('express');
const multer = require('multer');
const buildRoutes = require('../../helpers/routeBuilder');
const {generateFormFields} = require('../../../plugins/helpers/formHelper')
const path = require('path');
const { uploadToLinode } = require('../../../plugins/aws_sdk/setup'); // Adjust the path as needed
const Video = require('../../../plugins/mongo/models/Video'); // Adjust the path as needed

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/admin/videos');
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Route to handle video upload
router.post('/upload', upload.single('video'), async (req, res) => {
  try {
    const file = req.file;
    const fileKey = `admin/videos/${file.filename}`;
    const url = await uploadToLinode(file.path, fileKey);

    // Save video info to database
    const video = new Video({
      name: file.originalname,
      url: url,
      thumbnail: `${url}-thumbnail` // Assuming thumbnail generation logic
    });
    await video.save();

    res.status(200).send({ video: video });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error uploading video');
  }
});
router.get('/renderAddForm', (req, res) => {
  try {
    const model = Video.getModelFields();
    const formFields = generateFormFields(model);
    console.log('renderAddForm');

    res.render('forms/generalForm', {
      title: 'Add New Video',
      action: '/videos/create',
      formFields: formFields
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

// Route to render the form to edit an existing video
router.get('/renderEditForm/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const video = await new Video().getById(id);
    if (!video) {
      return res.status(404).send({ error: 'Video not found' });
    }
    const model = Video.getModelFields();
    const formFields = generateFormFields(model, video); // Generate form fields as an array

    res.render('forms/generalEditForm', {
      title: 'Edit Video',
      action: `videos/update/${id}`,
      routeSub: 'videos',
      method: 'post',
      formFields: formFields,
      data: video
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});
/////////////////
router.get('/section', async (req, res) => {
  try {
    const data = await neVideo().getAll();
    res.render('./layouts/section', {
      title: 'Section View',
      data: data
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

buildRoutes(new Video(), router);

module.exports = router;
