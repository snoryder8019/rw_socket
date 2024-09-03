import express from 'express';
import GameSprite from '../../../plugins/mongo/models/games/GameSprite.js';
import { buildRoutes } from '../../helpers/routeBuilder.js';
import generateFormFields from '../../../plugins/helpers/formHelper.js'
const router = express.Router();

// Route to render the form to add a new game sprite
router.get('/renderAddForm', (req, res) => {
  try {
    const model = GameSprite.getModelFields();
    const formFields = generateFormFields(model);
    res.render('forms/generalForm', {
      title: 'Add Game Sprite',
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
    const formFields = generateFormFields(model);

    res.render('forms/generalEditForm', {
      title: `Edit Game Sprite`,
      action: `/games/gameSprites/update/${id}`,
      routeSub: `gameSprites`,
      method: 'post',
      formFields: formFields,
      data: gameSprite,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

// Route to handle file upload and create a new game sprite


// Route to update an existing game sprite


// Use route builder to automatically generate CRUD routes
buildRoutes(new GameSprite(), router);

export default router;
