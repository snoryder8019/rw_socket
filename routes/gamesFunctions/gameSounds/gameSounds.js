import express from 'express';
import GameSound from '../../../plugins/mongo/models/games/GameSound.js';
import { buildRoutes } from '../../helpers/routeBuilder.js';

const router = express.Router();

// Route to render the form to add a new game sound
router.get('/renderAddForm', (req, res) => {
  try {
    const model = GameSound.getModelFields();
    res.render('forms/generalForm', {
      title: 'Add Game Sound',
      action: '/gameSounds/create',
      formFields: model,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

// Route to render the form to edit an existing game sound
router.get('/renderEditForm/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const gameSound = await new GameSound().getById(id);
    if (!gameSound) {
      return res.status(404).send({ error: 'Game Sound not found' });
    }

    const model = GameSound.getModelFields();
    res.render('forms/generalEditForm', {
      title: `Edit Game Sound`,
      action: `/gameSounds/update/${id}`,
      routeSub: `gameSounds`,
      method: 'post',
      formFields: model,
      data: gameSound,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

// Route to handle file upload and create a new game sound
router.post('/create', GameSound.prototype.middlewareForCreateRoute(), async (req, res) => {
  try {
    const gameSound = new GameSound(req.body);
    await gameSound.save();
    res.redirect('/gameSounds/section');
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

// Route to update an existing game sound
router.post('/update/:id', GameSound.prototype.middlewareForEditRoute(), async (req, res) => {
  try {
    const { id } = req.params;
    const gameSound = new GameSound(req.body);
    await gameSound.update(id);
    res.redirect('/gameSounds/section');
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

// Use route builder to automatically generate CRUD routes
buildRoutes(new GameSound(), router);

export default router;
