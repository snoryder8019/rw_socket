import express from 'express';
import Club from '../../../plugins/mongo/models/Club.js';
import generateFormFields from '../../../plugins/helpers/formHelper.js';
import { buildRoutes } from '../../helpers/routeBuilder.js';
import { uploadMultiple } from '../../../plugins/multer/setup.js';
import Vendor from '../../../plugins/mongo/models/Vendor.js';
import {imagesArray} from '../../../routes/helpers/imagesArray.js'
const router = express.Router();

// Route to render the form to add a new club
router.get('/renderAddForm', (req, res) => {
  try {
    const model = Club.getModelFields();
    const formFields = generateFormFields(model);
    console.log('renderAddForm');

    res.render('forms/generalForm', {
      title: 'Add New Club',
      action: '/clubs/create',
      formFields: formFields,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

// Route to render the form to edit an existing club
router.get('/renderEditForm/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const club = await new Club().getById(id);
    if (!club) {
      return res.status(404).send({ error: 'Club not found' });
    }

    const model = Club.getModelFields(); // This should return an object that defines field types
    const formFields = generateFormFields(model, club); // Generate form fields as an array

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
      title: `Edit Club`,
      action: `clubs/update/${id}`,
      routeSub: `clubs`,
      method: 'post',
      formFields: enhancedFormFields, // Use enhanced form fields
      data: club,
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
    const data = await new Club().getAll();
    res.render('./layouts/section', {
      title: 'Section View',
      data: data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});
router.post('/:id/upload-images',uploadMultiple, imagesArray(Club), async (req, res) => {
  try {
    res.status(200).json({ message: 'Club images uploaded and updated successfully', images: req.body.imagesArray });
  } catch (error) {
    console.error('Error processing images for Club:', error);
    res.status(500).send('Internal Server Error');
  }
});
buildRoutes(new Club(), router);

export default router;
