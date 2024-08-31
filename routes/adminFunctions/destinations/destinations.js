import express from 'express';
import Destination from '../../../plugins/mongo/models/travel/Destination.js';
import generateFormFields from '../../../plugins/helpers/formHelper.js';
import {imagesArray,getImagesArray,popImagesArray,popImagesArrayIndex,updateImagesArray} from '../../helpers/imagesArray.js'
import { uploadMultiple } from '../../../plugins/multer/setup.js';

import { buildRoutes } from '../../helpers/routeBuilder.js';

const router = express.Router();
const modelName = 'destination';
// Route to render the form to add a new destination
router.get('/renderAddForm', (req, res) => {
  try {
    const model = Destination.getModelFields();
    const formFields = generateFormFields(model);
    console.log('renderAddForm');

    res.render('forms/generalForm', {
      title: 'Destination',
      action: '/destinations/create',
      formFields: formFields,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

// Route to render the form to edit an existing destination
router.get('/renderEditForm/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const destination = await new Destination().getById(id);
    if (!destination) {
      return res.status(404).send({ error: 'Destination not found' });
    }

    const model = Destination.getModelFields(); // This should return an object that defines field types
    const formFields = generateFormFields(model, destination); // Generate form fields as an array

    // Iterate over form fields to ensure proper handling for arrays, objects, booleans
    const enhancedFormFields = formFields.map(field => {
      if (Array.isArray(field.value)) {
        // Handle array fields
        return {
          ...field,
          type: 'array',
          value: field.value, // Array of values to be iterated in the form
        };
      } else if (typeof field.value === 'object' && field.value !== null) {
        // Handle object fields
        return {
          ...field,
          type: 'object',
          value: Object.entries(field.value).map(([key, val]) => ({
            key,
            val,
          })),
        };
      } else if (typeof field.value === 'boolean') {
        // Handle boolean fields
        return {
          ...field,
          type: 'boolean',
          value: field.value,
        };
      }
      // Handle other types (string, number, etc.)
      return field;
    });

    res.render('forms/generalEditForm', {
      title: `Edit Destination`,
      action: `destinations/update/${id}`,
      routeSub: `destinations`,
      method: 'post',
      formFields: enhancedFormFields, // Use enhanced form fields
      data: destination,
      script:`<script>
          document.addEventListener('DOMContentLoaded', function () {
            // Your dynamic JS code here
            console.log('Page-specific JS loaded for Edit Form');
          });
        </script>`
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

/////////////////
router.get('/section', async (req, res) => {
  try {
    const data = await new Destination().getAll();
    res.render('./layouts/section', {
      title: 'Section View',
      data: data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});
router.post('/:id/upload-images',uploadMultiple, imagesArray(Destination));
router.get('/renderImagesArray/:id', getImagesArray(Destination))
router.get('/popImagesArray/:id/:url', popImagesArray(Destination))
router.get('/popImagesArrayIndex/:id/:index', popImagesArrayIndex(Destination))
buildRoutes(new Destination(), router);

export default router;
