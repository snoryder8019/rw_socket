// routes/adminFunctions/userImages/userImages.js
import express from 'express';
import UserImage from '../../../plugins/mongo/models/user/UserImage.js';
import generateFormFields from '../../../plugins/helpers/formHelper.js';
import { buildRoutes } from '../../helpers/routeBuilder.js';
import { uploadMultiple } from '../../../plugins/multer/setup.js';
import { imagesArray } from '../../../routes/helpers/imagesArray.js';
const router = express.Router();

// Route to render the form to add a new user image
router.get('/renderAddForm', (req, res) => {
  try {
    const model = UserImage.getModelFields();
    const formFields = generateFormFields(model);
    console.log('renderAddForm');

    res.render('forms/generalForm', {
      title: 'Add New User Image',
      action: '/userImages/create',
      formFields: formFields,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

// Route to render the form to edit an existing user image
router.get('/renderEditForm/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userImage = await new UserImage().getById(id);
    if (!userImage) {
      return res.status(404).send({ error: 'User Image not found' });
    }

    const model = UserImage.getModelFields();
    const formFields = generateFormFields(model, userImage);

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
      title: `Edit User Image`,
      action: `userImages/update/${id}`,
      routeSub: `userImages`,
      method: 'post',
      formFields: enhancedFormFields,
      data: userImage,
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
    const data = await new UserImage().getAll();
    res.render('./layouts/section', {
      title: 'Section View',
      data: data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

router.post('/:id/upload-images', uploadMultiple, imagesArray(UserImage), async (req, res) => {
  try {
    res.status(200).json({ message: 'User Image uploaded and updated successfully', images: req.body.imagesArray });
  } catch (error) {
    console.error('Error processing images for User Image:', error);
    res.status(500).send('Internal Server Error');
  }
});

buildRoutes(new UserImage(), router);

export default router;
