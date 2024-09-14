import express from 'express';
import Video from '../../../plugins/mongo/models/Video.js'; // Assuming the correct path
import generateFormFields from '../../../plugins/helpers/formHelper.js';
import { buildRoutes } from '../../helpers/routeBuilder.js';
import { imagesArray, getImagesArray, popImagesArray, popImagesArrayIndex } from '../../helpers/imagesArray.js';
import { uploadMultiple } from '../../../plugins/multer/setup.js'; // Assuming the correct setup for handling file uploads

const router = express.Router();
const modelName = 'video'; // Define the model name

// Route to render the form to add a new video
router.get('/renderAddForm', (req, res) => {
  try {
    const model = Video.getModelFields(); // Use the static method from Video to get model fields
    const formFields = generateFormFields(model);
    console.log('renderAddForm');

    res.render('forms/generalForm', {
      title: `Add New ${modelName}`,
      action: `/${modelName}s/create`,
      formFields: formFields,
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
    const video = await new Video().getById(id); // Fetch video by ID
    if (!video) {
      return res.status(404).send({ error: 'Video not found' });
    }

    const model = Video.getModelFields(); // Get the model fields
    const formFields = generateFormFields(model, video); // Generate form fields with existing video data

    // Handle special fields such as arrays, objects, booleans
    const enhancedFormFields = formFields.map(field => {
      if (Array.isArray(field.value)) {
        return { ...field, type: 'array', value: field.value };
      } else if (typeof field.value === 'object' && field.value !== null) {
        return {
          ...field,
          type: 'object',
          value: Object.entries(field.value).map(([key, val]) => ({ key, val })),
        };
      } else if (typeof field.value === 'boolean') {
        return { ...field, type: 'boolean', value: field.value };
      }
      return field;
    });

    res.render('forms/generalEditForm', {
      title: `Edit ${modelName}`,
      action: `${modelName}s/update/${id}`,
      routeSub: `${modelName}s`,
      method: 'post',
      formFields: enhancedFormFields,
      data: video,
      script: `<script>
          document.addEventListener('DOMContentLoaded', function () {
            console.log('Page-specific JS loaded for Edit Form');
          });
        </script>`
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

// Route to display videos
router.get('/section', async (req, res) => {
  try {
    const data = await new Video().getAll(); // Get all videos
    res.render(`./layouts/${modelName}`, {
      title: 'Video View',
      data: data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});
// Route to handle image uploads (assuming similar logic for videos)
router.post('/:id/upload-images', uploadMultiple, imagesArray(Video));
const createVid = async()=>{
  return new Video().createVid()
}
router.post('/createVid', async (req, res) => {
  try {
    const videoData = req.body;
    console.log('Received video data:', videoData); // Log incoming data

    const newVideo = await new Video().create(videoData);  // Call createVid on the new video
    res.status(201).send({ success: true, data: newVideo });
  } catch (error) {
    console.error('Error creating video:', error);
    res.status(500).send({ error: error.message });
  }
});

// Routes for managing image arrays (assuming you handle thumbnails or other images for the video)
router.get('/renderImagesArray/:id', getImagesArray(Video));
router.get('/popImagesArray/:id/:url', popImagesArray(Video));
router.get('/popImagesArrayIndex/:id/:index', popImagesArrayIndex(Video));
// Use RouteBuilder to dynamically build basic routes like create, update, and delete
buildRoutes(new Video(), router);

export default router;
