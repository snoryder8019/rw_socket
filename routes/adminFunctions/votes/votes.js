import express from 'express';
import Vote from '../../../plugins/mongo/models/blog/Vote.js';
import generateFormFields from '../../../plugins/helpers/formHelper.js';
import { buildRoutes } from '../../helpers/routeBuilder.js';
import { uploadMultiple } from '../../../plugins/multer/setup.js';
import { imagesArray } from '../../../routes/helpers/imagesArray.js';

const router = express.Router();

// Route to render the form to add a new vote
router.get('/renderAddForm', (req, res) => {
  try {
    const model = Vote.getModelFields();
    const formFields = generateFormFields(model);

    res.render('forms/generalForm', {
      title: 'Add New Vote',
      action: '/votes/create',
      formFields: formFields,
    });
  } catch (error) {
    console.error('Error loading add form:', error);
    res.status(500).send({ error: error.message });
  }
});

// Route to render the form to edit an existing vote
router.get('/renderEditForm/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const vote = await new Vote().getById(id);
    if (!vote) {
      return res.status(404).send({ error: 'Vote not found' });
    }

    const model = Vote.getModelFields();
    const formFields = generateFormFields(model, vote);

    // Enhanced form fields handling
    const enhancedFormFields = formFields.map(field => {
      if (Array.isArray(field.value)) {
        return {
          ...field,
          type: 'array',
          value: field.value, // Array of values
        };
      } else if (typeof field.value === 'object' && field.value !== null) {
        return {
          ...field,
          type: 'object',
          value: Object.entries(field.value).map(([key, val]) => ({ key, val })),
        };
      } else if (typeof field.value === 'boolean') {
        return {
          ...field,
          type: 'boolean',
          value: field.value,
        };
      }
      // Handle other types (text, number, etc.)
      return field;
    });

    res.render('forms/generalEditForm', {
      title: `Edit Vote`,
      action: `votes/update/${id}`,
      routeSub: `votes`,
      method: 'post',
      formFields: enhancedFormFields,
      data: vote,
      script: `<script>
        document.addEventListener('DOMContentLoaded', function () {
          console.log('Page-specific JS loaded for Edit Form');
        });
      </script>`,
    });
  } catch (error) {
    console.error('Error loading edit form:', error);
    res.status(500).send({ error: error.message });
  }
});

// Other routes, including image upload (if applicable)
router.post('/:id/upload-images', uploadMultiple, imagesArray(Vote), async (req, res) => {
  try {
    res.status(200).json({ message: 'Vote images uploaded successfully', images: req.body.imagesArray });
  } catch (error) {
    console.error('Error processing images for Vote:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Build routes for Vote
buildRoutes(new Vote(), router);

export default router;
