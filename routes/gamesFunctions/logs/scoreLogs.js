import express from 'express';
import ScoreLog from '../../../plugins/mongo/models/ScoreLog.js';
import generateFormFields from '../../../plugins/helpers/formHelper.js';
import { buildRoutes } from '../../helpers/routeBuilder.js';

const router = express.Router();
const modelName = 'scoreLog';

// Route to render the form to add a new score log
router.get('/renderAddForm', (req, res) => {
  try {
    const model = ScoreLog.getModelFields();
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

// Route to render the form to edit an existing score log
router.get('/renderEditForm/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const scoreLog = await new ScoreLog().getById(id);
    if (!scoreLog) {
      return res.status(404).send({ error: 'Score log not found' });
    }
    const model = ScoreLog.getModelFields();
    const formFields = generateFormFields(model, scoreLog); // Generate form fields as an array
    res.render('forms/generalEditForm', {
      title: `Edit ${modelName}`,
      action: `${modelName}s/update/${id}`,
      routeSub: `${modelName}s`,
      method: 'post',
      formFields: formFields,
      data: scoreLog,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

// Route to load score logs
router.get('/section', async (req, res) => {
  try {
    const data = await new ScoreLog().getAll();
    res.render(`./layouts/${modelName}`, {
      title: 'Score Log View',
      data: data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

buildRoutes(new ScoreLog(), router);

export default router;
