import express from 'express';
import GameMusic from '../../../plugins/mongo/models/games/GameMusic.js';
import { buildRoutes } from '../../helpers/routeBuilder.js';

const router = express.Router();

// Route to render the form to add a new game music track
router.get('/renderAddForm', (req, res) => {
  try {
    const model = GameMusic.getModelFields();
    res.render('forms/generalForm', {
      title: 'Add Game Music',
      action: '/gameMusic/create',
      formFields: model,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

// Route to render the form to edit an existing game music track
router.get('/renderEditForm/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const gameMusic = await new GameMusic().getById(id);
    if (!gameMusic) {
      return res.status(404).send({ error: 'Game Music not found' });
    }

    const model = GameMusic.getModelFields();
    res.render('forms/generalEditForm', {
      title: `Edit Game Music`,
      action: `/gameMusic/update/${id}`,
      routeSub: `gameMusic`,
      method: 'post',
      formFields: model,
      data: gameMusic,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

// Route to handle file upload and create a new game music track
router.post('/create', GameMusic.prototype.middlewareForCreateRoute(), async (req, res) => {
  try {
    const gameMusic = new GameMusic(req.body);
    await gameMusic.save();
    res.redirect('/gameMusic/section');
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

// Route to update an existing game music track
router.post('/update/:id', GameMusic.prototype.middlewareForEditRoute(), async (req, res) => {
  try {
    const { id } = req.params;
    const gameMusic = new GameMusic(req.body);
    await gameMusic.update(id);
    res.redirect('/gameMusic/section');
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

// Use route builder to automatically generate CRUD routes
buildRoutes(new GameMusic(), router);

export default router;
