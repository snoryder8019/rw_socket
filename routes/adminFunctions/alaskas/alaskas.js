//routes/adminFunctions/MODELS/MODELS.js
//routes/adminFunctions/alaskas/alaskas.js
import express from 'express';
import Alaska from '../../../plugins/mongo/models/Alaska.js';
import Users from '../../../plugins/mongo/models/User.js';
import generateFormFields from '../../../plugins/helpers/formHelper.js';
import { buildRoutes } from '../../helpers/routeBuilder.js';
import { uploadMultiple } from '../../../plugins/multer/setup.js';
import Vendor from '../../../plugins/mongo/models/Vendor.js';
import {imagesArray} from '../../helpers/imagesArray.js'
const router = express.Router();

// Route to render the form to add a new alaska
router.get('/renderAddForm', (req, res) => {
  try {
    const model = Alaska.getModelFields();
    const formFields = generateFormFields(model);
    console.log('renderAddForm');

    res.render('forms/generalForm', {
      title: 'Add New Alaska',
      action: '/alaskas/create',
      formFields: formFields,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

// Route to render the form to edit an existing alaska
router.get('/renderEditForm/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const alaska = await new Alaska().getById(id);
    if (!alaska) {
      return res.status(404).send({ error: 'Alaska not found' });
    }

    const model = Alaska.getModelFields(); // This should return an object that defines field types
    const formFields = generateFormFields(model, alaska); // Generate form fields as an array

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
      title: `Edit Alaska`,
      action: `alaskas/update/${id}`,
      routeSub: `alaskas`,
      method: 'post',
      formFields: enhancedFormFields, // Use enhanced form fields
      data: alaska,
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
    const data = await new Alaska().getAll();
    res.render('./layouts/section', {
      title: 'Section View',
      data: data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});
router.post('/:id/upload-images',uploadMultiple, imagesArray(Alaska), async (req, res) => {
  try {
    res.status(200).json({ message: 'Alaska images uploaded and updated successfully', images: req.body.imagesArray });
  } catch (error) {
    console.error('Error processing images for Alaska:', error);
    res.status(500).send('Internal Server Error');
  }
});
router.post('/assignAlaska', async (req, res) => {
  try {
    const { userId, alaskaId } = req.body;

    // Check if the user is already assigned to the alaska
    const user = await new Users().getById(userId);
    if (user.alaskas && user.alaskas.includes(alaskaId)) {
      return res.status(400).json({ success: false, message: 'User is already assigned to this alaska' });
    }
const updatedData = {alaskas:alaskaId}
    // Add the alaska to the user's alaskas array without duplication
    const result = await new Users().addToSet(userId,updatedData );

    // Check if the update was successful
    if (!result || result.modifiedCount === 0) {
      return res.status(500).json({ success: false, message: 'Failed to assign alaska or no changes detected' });
    }

    res.status(200).json({ success: true, message: 'Alaska assigned successfully' });
  } catch (error) {
    console.error('Error assigning alaska:', error);
    res.status(500).json({ success: false, message: 'Failed to assign alaska' });
  }
});


buildRoutes(new Alaska(), router);

export default router;
