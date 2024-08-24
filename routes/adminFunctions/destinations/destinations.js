import express from 'express';
import Destination from '../../../plugins/mongo/models/travel/Destination.js';
import generateFormFields from '../../../plugins/helpers/formHelper.js';
import { buildRoutes } from '../../helpers/routeBuilder.js';

const router = express.Router();
const modelName = 'destination';
// Route to render the form to add a new destination
router.get('/renderAddForm', (req, res) => {
  try {
    const model = Destination.getModelFields();
    const formFields = generateFormFields(model);
    console.log('renderAddForm');

    res.render('forms/generalForm', {
      title: 'ADestination',
      action: '/destinations/create',
      formFields: formFields,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

// Route to render the form to edit an existing destination
router.get('/renderEditForm/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const destination = await new Destination().getById(id);
    if (!destination) {
      return res.status(404).send({ error: 'Destination not found' });
    }
    const model = Destination.getModelFields();
    const formFields = generateFormFields(model, destination); // Generate form fields as an array

    res.render('forms/generalEditForm', {
      title: 'Edit Destination',
      action: `destinations/update/${id}`,
      routeSub: 'destinations',
      method: 'post',
      formFields: formFields,
      data: destination,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});
/////////////////
router.get('/section', async (req, res) => {
  try {
    const data = await new Destination().getAll();
    res.render('./layouts/section', {
      title: 'Section View',
      data: data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

buildRoutes(new Destination(), router);

export default router;
