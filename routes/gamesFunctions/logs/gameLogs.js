import express from 'express';
import GameLog from '../../../plugins/mongo/models/games/GameLog.js';
import generateFormFields from '../../../plugins/helpers/formHelper.js';
import { buildRoutes } from '../../helpers/routeBuilder.js';

const router = express.Router();
const modelName = 'gameLog';

// Route to render the form to add a new game log
router.get('/renderAddForm', (req, res) => {
  try {
    const model = GameLog.getModelFields();
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

// Route to render the form to edit an existing game log
router.get('/renderEditForm/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const gameLog = await new GameLog().getById(id);
    if (!gameLog) {
      return res.status(404).send({ error: 'Game log not found' });
    }
    const model = GameLog.getModelFields();
    const formFields = generateFormFields(model, gameLog); // Generate form fields as an array
    res.render('forms/generalEditForm', {
      title: `Edit ${modelName}`,
      action: `${modelName}s/update/${id}`,
      routeSub: `${modelName}s`,
      method: 'post',
      formFields: formFields,
      data: gameLog,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

// Route to load game logs
router.get('/section', async (req, res) => {
  try {
    const data = await new GameLog().getAll();
    res.render(`./layouts/${modelName}`, {
      title: 'Game Log View',
      data: data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

buildRoutes(new GameLog(), router);

export default router;
