//routes/adminFunctions/MODELS/MODELS.js
//routes/adminFunctions/greeces/greeces.js
import express from 'express';
import Greece from '../../../plugins/mongo/models/Greece.js';
import Users from '../../../plugins/mongo/models/User.js';
import generateFormFields from '../../../plugins/helpers/formHelper.js';
import { buildRoutes } from '../../helpers/routeBuilder.js';
import { uploadMultiple } from '../../../plugins/multer/setup.js';
import Vendor from '../../../plugins/mongo/models/Vendor.js';
import {imagesArray} from '../../helpers/imagesArray.js'
const router = express.Router();

// Route to render the form to add a new greece
router.get('/renderAddForm', (req, res) => {
  try {
    const model = Greece.getModelFields();
    const formFields = generateFormFields(model);
    console.log('renderAddForm');

    res.render('forms/generalForm', {
      title: 'Add New Greece',
      action: '/greeces/create',
      formFields: formFields,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

// Route to render the form to edit an existing greece
router.get('/renderEditForm/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const greece = await new Greece().getById(id);
    if (!greece) {
      return res.status(404).send({ error: 'Greece not found' });
    }

    const model = Greece.getModelFields(); // This should return an object that defines field types
    const formFields = generateFormFields(model, greece); // Generate form fields as an array

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
      title: `Edit Greece`,
      action: `greeces/update/${id}`,
      routeSub: `greeces`,
      method: 'post',
      formFields: enhancedFormFields, // Use enhanced form fields
      data: greece,
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
    const data = await new Greece().getAll();
    res.render('./layouts/section', {
      title: 'Section View',
      data: data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});
router.post('/:id/upload-images',uploadMultiple, imagesArray(Greece), async (req, res) => {
  try {
    res.status(200).json({ message: 'Greece images uploaded and updated successfully', images: req.body.imagesArray });
  } catch (error) {
    console.error('Error processing images for Greece:', error);
    res.status(500).send('Internal Server Error');
  }
});
router.post('/assignGreece', async (req, res) => {
  try {
    const { userId, greeceId } = req.body;

    // Check if the user is already assigned to the greece
    const user = await new Users().getById(userId);
    if (user.greeces && user.greeces.includes(greeceId)) {
      return res.status(400).json({ success: false, message: 'User is already assigned to this greece' });
    }
const updatedData = {greeces:greeceId}
    // Add the greece to the user's greeces array without duplication
    const result = await new Users().addToSet(userId,updatedData );

    // Check if the update was successful
    if (!result || result.modifiedCount === 0) {
      return res.status(500).json({ success: false, message: 'Failed to assign greece or no changes detected' });
    }

    res.status(200).json({ success: true, message: 'Greece assigned successfully' });
  } catch (error) {
    console.error('Error assigning greece:', error);
    res.status(500).json({ success: false, message: 'Failed to assign greece' });
  }
});


buildRoutes(new Greece(), router);

export default router;
