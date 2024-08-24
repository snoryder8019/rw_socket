import express from 'express';
import WebappSetting from '../../../plugins/mongo/models/WebappSetting.js';
import generateFormFields from '../../../plugins/helpers/formHelper.js';
import { buildRoutes } from '../../helpers/routeBuilder.js';

const router = express.Router();
const modelName = 'webappSetting';

// Route to render the form to add a new web app setting
router.get('/renderAddForm', (req, res) => {
  try {
    const model = WebappSetting.getModelFields();
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

// Route to render the form to edit an existing web app setting
router.get('/renderEditForm/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const webappSetting = await new WebappSetting().getById(id);
    if (!webappSetting) {
      return res.status(404).send({ error: 'Web app setting not found' });
    }
    const model = WebappSetting.getModelFields();
    const formFields = generateFormFields(model, webappSetting); // Generate form fields as an array
    res.render('forms/generalEditForm', {
      title: `Edit ${modelName}`,
      action: `${modelName}s/update/${id}`,
      routeSub: `${modelName}s`,
      method: 'post',
      formFields: formFields,
      data: webappSetting,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

// Route to load web app settings
router.get('/section', async (req, res) => {
  try {
    const data = await new WebappSetting().getAll();
    res.render(`./layouts/${modelName}`, {
      title: 'Web App Settings View',
      data: data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

buildRoutes(new WebappSetting(), router);

export default router;
