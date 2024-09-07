import express from 'express';
import GameSprite from '../../../plugins/mongo/models/games/GameSprite.js';
import generateFormFields from '../../../plugins/helpers/formHelper.js';
import { buildRoutes } from '../../helpers/routeBuilder.js';
import { uploadMultiple } from '../../../plugins/multer/setup.js';
import { imagesArray } from '../../../routes/helpers/imagesArray.js';

const router = express.Router();

// Route to render the form to add a new game sprite
router.get('/renderAddForm', (req, res) => {
  try {
    const model = GameSprite.getModelFields();
    const formFields = generateFormFields(model);
    console.log('renderAddForm');

    res.render('forms/generalForm', {
      title: 'Add New Game Sprite',
      action: '/games/gameSprites/create',
      formFields: formFields,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

// Route to render the form to edit an existing game sprite
router.get('/renderEditForm/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const gameSprite = await new GameSprite().getById(id);
    if (!gameSprite) {
      return res.status(404).send({ error: 'Game Sprite not found' });
    }

    const model = GameSprite.getModelFields();
    const formFields = generateFormFields(model, gameSprite);

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
      title: `Edit Game Sprite`,
      action: `/games/gameSprites/update/${id}`,
      routeSub: `gameSprites`,
      method: 'post',
      formFields: enhancedFormFields,
      data: gameSprite,
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

// Route to render a section view for game sprites (similar to clubs' section)
router.get('/section', async (req, res) => {
  try {
    const data = await new GameSprite().getAll();
    res.render('./layouts/section', {
      title: 'Game Sprite Section View',
      data: data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

// Route to handle image uploads for a game sprite
router.post('/:id/upload-images', uploadMultiple, imagesArray(GameSprite), async (req, res) => {
  try {
    res.status(200).json({ message: 'Game Sprite images uploaded and updated successfully', images: req.body.imagesArray });
  } catch (error) {
    console.error('Error processing images for Game Sprite:', error);
    res.status(500).send('Internal Server Error');
  }
});

buildRoutes(new GameSprite(), router);

export default router;
