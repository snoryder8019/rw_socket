import express from 'express';
import PlayerUser from '../../../plugins/mongo/models/players/PlayerUser.js';
import generateFormFields from '../../../plugins/helpers/formHelper.js';
import { buildRoutes } from '../../helpers/routeBuilder.js';

const router = express.Router();
const modelName = 'playerUser';

// Route to render the form to add a new player user
router.get('/renderAddForm', (req, res) => {
  try {
    const model = PlayerUser.getModelFields();
    const formFields = generateFormFields(model);
    console.log('renderAddForm');

    res.render('forms/generalForm', {
      title: 'Player User',
      action: '/playerUsers/create',
      formFields: formFields,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

// Route to render the form to edit an existing player user
router.get('/renderEditForm/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const playerUser = await new PlayerUser().getById(id);
    if (!playerUser) {
      return res.status(404).send({ error: 'Player User not found' });
    }

    const model = PlayerUser.getModelFields();
    const formFields = generateFormFields(model, playerUser);

    res.render('forms/generalEditForm', {
      title: `Edit Player User`,
      action: `/playerUsers/update/${id}`,
      routeSub: `playerUsers`,
      method: 'post',
      formFields: formFields,
      data: playerUser,
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

// Route to view all player users
router.get('/section', async (req, res) => {
  try {
    const data = await new PlayerUser().getAll();
    res.render('./layouts/section', {
      title: 'Player Users Section View',
      data: data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

// Route to create a new player user
router.post('/create', async (req, res) => {
  try {
    const playerUser = new PlayerUser(req.body);
    await playerUser.save();
    res.redirect('/playerUsers/section');
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

// Route to update an existing player user
router.post('/update/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const playerUser = new PlayerUser(req.body);
    await playerUser.update(id);
    res.redirect('/playerUsers/section');
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

// Use route builder to automatically generate CRUD routes
buildRoutes(new PlayerUser(), router);

export default router;
