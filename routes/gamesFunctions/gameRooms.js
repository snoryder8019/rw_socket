import express from 'express';
import GameRoom from '../../../plugins/mongo/models/GameRoom.js';
import generateFormFields from '../../../plugins/helpers/formHelper.js';
import { buildRoutes } from '../../helpers/routeBuilder.js';

const router = express.Router();
const modelName = 'gameRoom';

// Route to render the form to add a new game room
router.get('/renderAddForm', (req, res) => {
  try {
    const model = GameRoom.getModelFields();
    const formFields = generateFormFields(model);
    console.log('renderAddForm');

    res.render('forms/generalForm', {
      title: `Add New ${modelName}`,
      action: `/${modelName}s/create`,
      formFields: formFields,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

// Route to render the form to edit an existing game room
router.get('/renderEditForm/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const gameRoom = await new GameRoom().getById(id);
    if (!gameRoom) {
      return res.status(404).send({ error: 'Game room not found' });
    }
    const model = GameRoom.getModelFields();
    const formFields = generateFormFields(model, gameRoom); // Generate form fields as an array
    res.render('forms/generalEditForm', {
      title: `Edit ${modelName}`,
      action: `${modelName}s/update/${id}`,
      routeSub: `${modelName}s`,
      method: 'post',
      formFields: formFields,
      data: gameRoom,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

// Route to load game rooms
router.get('/section', async (req, res) => {
  try {
    const data = await new GameRoom().getAll();
    res.render(`./layouts/${modelName}`, {
      title: 'Game Room View',
      data: data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

buildRoutes(new GameRoom(), router);

export default router;
