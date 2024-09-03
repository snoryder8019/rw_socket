import express from 'express';
import Game from '../../../plugins/mongo/models/games/Game.js';
import generateFormFields from '../../../plugins/helpers/formHelper.js';
import {imagesArray, getImagesArray, popImagesArray, popImagesArrayIndex, updateImagesArray} from '../../helpers/imagesArray.js';
import { uploadMultiple } from '../../../plugins/multer/setup.js';

import { buildRoutes } from '../../helpers/routeBuilder.js';

const router = express.Router();
const modelName = 'game';

// Route to render the form to add a new game
router.get('/renderAddForm', (req, res) => {
  try {
    const model = Game.getModelFields();
    const formFields = generateFormFields(model);
    console.log('renderAddForm');

    res.render('forms/generalForm', {
      title: 'Game',
      action: '/games/games/create',
      formFields: formFields,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

// Route to render the form to edit an existing game
router.get('/renderEditForm/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const game = await new Game().getById(id);
    if (!game) {
      return res.status(404).send({ error: 'Game not found' });
    }

    const model = Game.getModelFields();
    const formFields = generateFormFields(model, game);

    // Enhance form fields for different data types
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
      title: `Edit Game`,
      action: `/games/games/update/${id}`,
      routeSub: `games`,
      method: 'post',
      formFields: enhancedFormFields,
      data: game,
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

// Other routes
router.get('/section', async (req, res) => {
  try {
    const data = await new Game().getAll();
    res.render('./layouts/section', {
      title: 'Section View',
      data: data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

router.post('/:id/upload-images', uploadMultiple, imagesArray(Game));
router.get('/renderImagesArray/:id', getImagesArray(Game));
router.get('/popImagesArray/:id/:url', popImagesArray(Game));
router.get('/popImagesArrayIndex/:id/:index', popImagesArrayIndex(Game));

// Use route builder to automatically generate CRUD routes
buildRoutes(new Game(), router);

export default router;
