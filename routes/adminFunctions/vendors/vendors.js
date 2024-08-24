import express from 'express';
import Vendor from '../../../plugins/mongo/models/Vendor.js';
import generateFormFields from '../../../plugins/helpers/formHelper.js';
import { buildRoutes } from '../../helpers/routeBuilder.js';

const router = express.Router();
const modelName = 'vendor';
// Route to render the form to add a new vendor
router.get('/renderAddForm', (req, res) => {
  try {
    const model = Vendor.getModelFields();
    const formFields = generateFormFields(model);
    console.log('renderAddForm');

    res.render('forms/generalForm', {
      title: 'Add New Vendor',
      action: '/vendors/create',
      formFields: formFields,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

// Route to render the form to edit an existing vendor
router.get('/renderEditForm/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const vendor = await new Vendor().getById(id);
    if (!vendor) {
      return res.status(404).send({ error: 'Vendor not found' });
    }
    const model = Vendor.getModelFields();
    const formFields = generateFormFields(model, vendor); // Generate form fields as an array

    res.render('forms/generalEditForm', {
      title: 'Edit Vendor',
      action: `vendors/update/${id}`,
      routeSub: 'vendors',
      method: 'post',
      formFields: formFields,
      data: vendor,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});
/////////////////
router.get('/section', async (req, res) => {
  try {
    const data = await new Vendor().getAll();
    res.render('./layouts/section', {
      title: 'Section View',
      data: data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

buildRoutes(new Vendor(), router);

export default router;
