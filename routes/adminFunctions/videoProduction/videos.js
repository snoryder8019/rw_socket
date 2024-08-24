//routes/adminfunctions/videoProductions.js **NODE GPT: DONT REMOVE THIS LINE**
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
router.post('/upload', upload.single('videoFile'), async (req, res) => {
  try {
    console.log('Uploading video...');
    const videoFile = req.file;

    if (!videoFile) {
      console.error('No video file provided');
      return res.status(400).send('No video file provided');
    }

    // Call the createVid method to handle upload and DB save
    const video = await new Video().createVid(videoFile);

    if (!video) {
      console.error('Failed to create video entry in database');
      return res.status(500).send('Failed to create video entry in database');
    }

    console.log(`Video uploaded and saved: ${video.url}`);
    req.flash('success', `Video: ${videoFile.originalname} uploaded successfully`);
    res.redirect('/');
  } catch (error) {
    console.error("Error uploading video:", error);
    res.status(500).render('error', { error: error });
  }
});
router.post('/createVid', async(req,res)=>{ 
  try{  
   const response = await new Video().createVid()
    res.send(response)
  }
  catch(error){console.error(error)}
})
router.post('/updateVid/:id', async(req,res)=>{ 
  try{  
    const {id}= req.params;
    const updates=req.body;
    
    console.log(`update:${updates}\nid: ${id}`)
   const response = await new Video().updateVid(id,file,updates)
    res.send(response)
  }
  catch(error){console.error(error)}
})
router.get('/renderAddForm', (req, res) => {
  try {
    const model = Video.getModelFields();
    const formFields = generateFormFields(model);
    console.log('renderAddForm');

    res.render('forms/generalForm', {
      title: 'Add New Video',
      action: '/videos/upload',
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
      action: `videos/updateVid/${id}`,
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
