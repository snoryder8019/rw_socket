import express from 'express';
import PlayerCard from '../../../plugins/mongo/models/games/PlayerCard.js';
import { generateFormFields } from '../../../plugins/helpers/formHelper.js';
import { buildRoutes } from '../../helpers/routeBuilder.js';

const router = express.Router();
const modelName = 'playerCard';

// Route to render the form to add a new player card
router.get('/renderAddForm', (req, res) => {
  try {
    const model = PlayerCard.getModelFields();
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
    const playerCard = await new PlayerCard().getById(id);
    if (!playerCard) {
      return res.status(404).send({ error: 'Player card not found' });
    }
    const model = PlayerCard.getModelFields();
    const formFields = generateFormFields(model, playerCard); // Generate form fields as an array
    res.render('forms/generalEditForm', {
      title: `Edit ${modelName}`,
      action: `${modelName}s/update/${id}`,
      routeSub: `${modelName}s`,
      method: 'post',
      formFields: formFields,
      data: playerCard,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

// Route to load player cards
router.get('/section', async (req, res) => {
  try {
    const data = await new PlayerCard().getAll();
    res.render(`./layouts/${modelName}`, {
      title: 'Player Card View',
      data: data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

buildRoutes(new PlayerCard(), router);

export default router;
