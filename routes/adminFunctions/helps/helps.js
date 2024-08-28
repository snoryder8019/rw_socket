import express from 'express';
import Help from '../../../plugins/mongo/models/help/Help.js';
import generateFormFields from '../../../plugins/helpers/formHelper.js';
import { buildRoutes } from '../../helpers/routeBuilder.js';

const router = express.Router();
const modelName = 'help';
// Route to render the form to add a new help
router.get('/renderAddForm', (req, res) => {
  try {
    const model = Help.getModelFields();
    const formFields = generateFormFields(model);
    console.log('renderAddForm');

    res.render('forms/generalForm', {
      title: 'Add New Help',
      action: '/helps/create',
      formFields: formFields,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

router.get('/renderEditForm/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const help = await new Help().getById(id);
    if (!help) {
      return res.status(404).send({ error: 'Help not found' });
    }
    const model = Help.getModelFields();
    const formFields = generateFormFields(model, help); // Generate form fields as an array

    res.render('forms/generalEditForm', {
      title: 'Edit Help',
      action: `helps/update/${id}`,
      routeSub: 'helps',
      method: 'post',
      formFields: formFields,
      data: help,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});
/////////////////
router.get('/section', async (req, res) => {
  try {
    const data = await new Help().getAll();
    res.render('./layouts/section', {
      title: 'Section View',
      data: data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

buildRoutes(new Help(), router);

export default router;
