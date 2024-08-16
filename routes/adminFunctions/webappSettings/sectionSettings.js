import express from 'express';
import SectionSetting from '../../../plugins/mongo/models/SectionSetting.js';
import { generateFormFields } from '../../../plugins/helpers/formHelper.js';
import { buildRoutes } from '../../helpers/routeBuilder.js';

const router = express.Router();
const modelName = 'sectionSetting';
// Route to render the form to add a new section setting
router.get('/renderAddForm', (req, res) => {
  try {
    const model = SectionSetting.getModelFields();
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

// Route to render the form to edit an existing section setting
router.get('/renderEditForm/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const sectionSetting = await new SectionSetting().getById(id);
    if (!sectionSetting) {
      return res.status(404).send({ error: 'Section setting not found' });
    }
    const model = SectionSetting.getModelFields();
    const formFields = generateFormFields(model, sectionSetting); // Generate form fields as an array
    res.render('forms/generalEditForm', {
      title: `Edit ${modelName}`,
      action: `${modelName}s/update/${id}`,
      routeSub: `${modelName}s`,
      method: 'post',
      formFields: formFields,
      data: sectionSetting,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});
/////////////////
router.get('/section', async (req, res) => {
  try {
    const data = await new SectionSetting().getAll();
    res.render(`./layouts/${modelName}`, {
      title: 'Section View',
      data: data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

buildRoutes(new SectionSetting(), router);

export default router;
