import express from 'express';
import GameElement from '../../../plugins/mongo/models/games/GameElement.js';
import { buildRoutes } from '../../helpers/routeBuilder.js';

const router = express.Router();

// Route to render the form to add a new game element
router.get('/renderAddForm', (req, res) => {
  try {
    const model = GameElement.getModelFields();
    res.render('forms/generalForm', {
      title: 'Add Game Element',
      action: '/gameElements/create',
      formFields: model,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

// Route to render the form to edit an existing game element
router.get('/renderEditForm/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const gameElement = await new GameElement().getById(id);
    if (!gameElement) {
      return res.status(404).send({ error: 'Game Element not found' });
    }

    const model = GameElement.getModelFields();
    res.render('forms/generalEditForm', {
      title: `Edit Game Element`,
      action: `/gameElements/update/${id}`,
      routeSub: `gameElements`,
      method: 'post',
      formFields: model,
      data: gameElement,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

// Route to handle file upload and create a new game element
router.post('/create', GameElement.prototype.middlewareForCreateRoute(), async (req, res) => {
  try {
    const gameElement = new GameElement(req.body);
    await gameElement.save();
    res.redirect('/gameElements/section');
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

// Route to update an existing game element
router.post('/update/:id', GameElement.prototype.middlewareForEditRoute(), async (req, res) => {
  try {
    const { id } = req.params;
    const gameElement = new GameElement(req.body);
    await gameElement.update(id);
    res.redirect('/gameElements/section');
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

// Use route builder to automatically generate CRUD routes
buildRoutes(new GameElement(), router);

export default router;
