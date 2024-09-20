// routes/adminFunctions/avatars/avatars.js
import express from 'express';
import Avatar from '../../../plugins/mongo/models/Avatar.js';
import generateFormFields from '../../../plugins/helpers/formHelper.js';
import { buildRoutes } from '../../helpers/routeBuilder.js';
import { uploadMultiple } from '../../../plugins/multer/setup.js';
import { imagesArray } from '../../../routes/helpers/imagesArray.js';
const router = express.Router();

// Route to render the form to add a new avatar
router.get('/renderAddForm', (req, res) => {
  try {
    const model = Avatar.getModelFields();
    const formFields = generateFormFields(model);
    console.log('renderAddForm');

    res.render('forms/generalForm', {
      title: 'Add New Avatar',
      action: '/avatars/create',
      formFields: formFields,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

// Route to render the form to edit an existing avatar
router.get('/renderEditForm/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const avatar = await new Avatar().getById(id);
    if (!avatar) {
      return res.status(404).send({ error: 'Avatar not found' });
    }

    const model = Avatar.getModelFields();
    const formFields = generateFormFields(model, avatar);

    const enhancedFormFields = formFields.map(field => {
      if (Array.isArray(field.value)) {
        return {
          ...field,
          type: 'array',
          value: field.value,
        };
      } else if (typeof field.value === 'object' && field.value !== null) {
        return {
          ...field,
          type: 'object',
          value: Object.entries(field.value).map(([key, val]) => ({
            key,
            val,
          })),
        };
      } else if (typeof field.value === 'boolean') {
        return {
          ...field,
          type: 'boolean',
          value: field.value,
        };
      }
      return field;
    });

    res.render('forms/generalEditForm', {
      title: `Edit Avatar`,
      action: `avatars/update/${id}`,
      routeSub: `avatars`,
      method: 'post',
      formFields: enhancedFormFields,
      data: avatar,
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

/////////////////
router.get('/section', async (req, res) => {
  try {
    const data = await new Avatar().getAll();
    res.render('./layouts/section', {
      title: 'Section View',
      data: data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

router.post('/:id/upload-images', uploadMultiple, imagesArray(Avatar), async (req, res) => {
  try {
    res.status(200).json({ message: 'Avatar images uploaded and updated successfully', images: req.body.imagesArray });
  } catch (error) {
    console.error('Error processing images for Avatar:', error);
    res.status(500).send('Internal Server Error');
  }
});

buildRoutes(new Avatar(), router);

export default router;
