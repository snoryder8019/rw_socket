import express from 'express';
import Marquee from '../../../plugins/mongo/models/Marquee.js';
import generateFormFields from '../../../plugins/helpers/formHelper.js';
import { buildRoutes } from '../../helpers/routeBuilder.js';
import { uploadMultiple } from '../../../plugins/multer/setup.js';
import { imagesArray } from '../../../routes/helpers/imagesArray.js';
const router = express.Router();

// Route to render the form to add a new marquee
router.get('/renderAddForm', (req, res) => {
  try {
    const model = Marquee.getModelFields();
    const formFields = generateFormFields(model);
    console.log('renderAddForm');

    res.render('forms/generalForm', {
      title: 'Add New Marquee',
      action: '/marquees/create',
      formFields: formFields,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

// Route to render the form to edit an existing marquee
router.get('/renderEditForm/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const marquee = await new Marquee().getById(id);
    if (!marquee) {
      return res.status(404).send({ error: 'Marquee not found' });
    }
    const model = Marquee.getModelFields();
    const formFields = generateFormFields(model, marquee); // Generate form fields as an array

    res.render('forms/generalEditForm', {
      title: 'Edit Marquee',
      action: `marquees/update/${id}`,
      routeSub: 'marquees',
      method: 'post',
      formFields: formFields,
      data: marquee,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

router.post('/:id/upload-images', uploadMultiple, imagesArray(Marquee), async (req, res) => {
  try {
    res.status(200).json({ message: 'Marquee images uploaded and updated successfully', images: req.body.imagesArray });
  } catch (error) {
    console.error('Error processing images for Marquee:', error);
    res.status(500).send('Internal Server Error');
  }
});

buildRoutes(new Marquee(), router);

export default router;
