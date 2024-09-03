import express from 'express';
import GameSprite from '../../../plugins/mongo/models/games/GameSprite.js';
import { buildRoutes } from '../../helpers/routeBuilder.js';

const router = express.Router();

// Route to render the form to add a new game sprite
router.get('/renderAddForm', (req, res) => {
  try {
    const model = GameSprite.getModelFields();
    res.render('forms/generalForm', {
      title: 'Add Game Sprite',
      action: '/games/gameSprites/create',
      formFields: model,
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
    res.render('forms/generalEditForm', {
      title: `Edit Game Sprite`,
      action: `/games/gameSprites/update/${id}`,
      routeSub: `gameSprites`,
      method: 'post',
      formFields: model,
      data: gameSprite,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

// Route to handle file upload and create a new game sprite
router.post('/create', GameSprite.prototype.middlewareForCreateRoute(), async (req, res) => {
  try {
    const gameSprite = new GameSprite(req.body);
    await gameSprite.save();
    res.redirect('/gameSprites/section');
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

// Route to update an existing game sprite
router.post('/update/:id', GameSprite.prototype.middlewareForEditRoute(), async (req, res) => {
  try {
    const { id } = req.params;
    const gameSprite = new GameSprite(req.body);
    await gameSprite.update(id);
    res.redirect('/gameSprites/section');
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

// Use route builder to automatically generate CRUD routes
buildRoutes(new GameSprite(), router);

export default router;
