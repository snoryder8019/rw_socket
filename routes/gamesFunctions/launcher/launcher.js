import express from 'express';
import Launcher from '../../../plugins/mongo/models/games/Launcher.js';
import generateFormFields from '../../../plugins/helpers/formHelper.js';
import { buildRoutes } from '../../helpers/routeBuilder.js';

const router = express.Router();
const modelName = 'launcher';

// Route to render the form to add a new launcher
router.get('/renderAddForm', (req, res) => {
  try {
    const model = Launcher.getModelFields();
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

// Route to render the form to edit an existing launcher
router.get('/renderEditForm/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const launcher = await new Launcher().getById(id);
    if (!launcher) {
      return res.status(404).send({ error: 'Launcher not found' });
    }
    const model = Launcher.getModelFields();
    const formFields = generateFormFields(model, launcher); // Generate form fields as an array
    res.render('forms/generalEditForm', {
      title: `Edit ${modelName}`,
      action: `${modelName}s/update/${id}`,
      routeSub: `${modelName}s`,
      method: 'post',
      formFields: formFields,
      data: launcher,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

// Route to load launchers
router.get('/section', async (req, res) => {
  try {
    const data = await new Launcher().getAll();
    res.render(`./layouts/${modelName}`, {
      title: 'Launcher View',
      data: data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

buildRoutes(new Launcher(), router);

export default router;
