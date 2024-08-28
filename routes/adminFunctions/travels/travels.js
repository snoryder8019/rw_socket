import express from 'express';
import Travel from '../../../plugins/mongo/models/Travel.js';
import generateFormFields from '../../../plugins/helpers/formHelper.js';
import { buildRoutes } from '../../helpers/routeBuilder.js';
import {imagesArray} from '../../helpers/imagesArray.js'
import { uploadMultiple } from '../../../plugins/multer/setup.js';
const router = express.Router();
const modelName = 'travel';
// Route to render the form to add a new travel
router.get('/renderAddForm', (req, res) => {
  try {
    const model = Travel.getModelFields();
    const formFields = generateFormFields(model);
    console.log('renderAddForm');

    res.render('forms/generalForm', {
      title: 'Add New Travel',
      action: '/travels/create',
      formFields: formFields,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

// Route to render the form to edit an existing travel
router.get('/renderEditForm/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const travel = await new Travel().getById(id);
    if (!travel) {
      return res.status(404).send({ error: 'Travel not found' });
    }
    const model = Travel.getModelFields();
    const formFields = generateFormFields(model, travel); // Generate form fields as an array

    res.render('forms/generalEditForm', {
      title: 'Edit Travel',
      action: `travels/update/${id}`,
      routeSub: 'travels',
      method: 'post',
      formFields: formFields,
      data: travel,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});
/////////////////
router.get('/section', async (req, res) => {
  try {
    const data = await new Travel().getAll();
    res.render('./layouts/section', {
      title: 'Section View',
      data: data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});
router.post('/:id/upload-images',uploadMultiple, imagesArray(Travel), async (req, res) => {
  try {
    res.status(200).json({ message: 'Tavels images uploaded and updated successfully', images: req.body.imagesArray });
  } catch (error) {
    console.error('Error processing images for Club:', error);
    res.status(500).send('Internal Server Error');
  }
});
buildRoutes(new Travel(), router);

export default router;
