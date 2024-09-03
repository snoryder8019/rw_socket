import express from 'express';
import PlayerUser from '../../../plugins/mongo/models/games/PlayerUser.js';
import generateFormFields from '../../../plugins/helpers/formHelper.js';
import { buildRoutes } from '../../helpers/routeBuilder.js';

const router = express.Router();
const modelName = 'playerUser';

// Route to render the form to add a new player card
router.get('/renderAddForm', (req, res) => {
  try {
    const model = PlayerUser.getModelFields();
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

// Route to render the form to edit an existing player card
router.get('/renderEditForm/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const playerUser = await new PlayerUser().getById(id);
    if (!playerUser) {
      return res.status(404).send({ error: 'Player card not found' });
    }
    const model = PlayerUser.getModelFields();
    const formFields = generateFormFields(model, playerUser); // Generate form fields as an array
    res.render('forms/generalEditForm', {
      title: `Edit ${modelName}`,
      action: `${modelName}s/update/${id}`,
      routeSub: `${modelName}s`,
      method: 'post',
      formFields: formFields,
      data: playerUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

// Route to load player cards
router.get('/section', async (req, res) => {
  try {
    const data = await new PlayerUser().getAll();
    res.render(`./layouts/${modelName}`, {
      title: 'Player Card View',
      data: data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

buildRoutes(new PlayerUser(), router);

export default router;
