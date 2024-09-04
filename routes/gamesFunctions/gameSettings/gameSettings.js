import express from 'express';
import GameSetting from '../../../plugins/mongo/models/games/GameSetting.js';
import generateFormFields from '../../../plugins/helpers/formHelper.js';
import { buildRoutes } from '../../helpers/routeBuilder.js';

const router = express.Router();
const modelName = 'gameSetting';

// Route to render the form to add a new game setting
router.get('/renderAddForm', (req, res) => {
  try {
    const model = GameSetting.getModelFields();
    const formFields = generateFormFields(model);
    console.log('renderAddForm');

    res.render('forms/generalForm', {
      title: 'Game Setting',
      action: '/games/gameSettings/create',
      formFields: formFields,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

// Route to render the form to edit an existing game setting
router.get('/renderEditForm/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const gameSetting = await new GameSetting().getById(id);
    if (!gameSetting) {
      return res.status(404).send({ error: 'Game Setting not found' });
    }

    const model = GameSetting.getModelFields();
    const formFields = generateFormFields(model, gameSetting);

    res.render('forms/generalEditForm', {
      title: `Edit Game Setting`,
      action: `/games/gameSettings/update/${id}`,
      routeSub: `gameSettings`,
      method: 'post',
      formFields: formFields,
      data: gameSetting,
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

// Route to view all game settings
router.get('/section', async (req, res) => {
  try {
    const data = await new GameSetting().getAll();
    res.render('./layouts/section', {
      title: 'Game Settings Section View',
      data: data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});


// Use route builder to automatically generate CRUD routes
buildRoutes(new GameSetting(), router);

export default router;
