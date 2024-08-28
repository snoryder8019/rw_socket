import express from 'express';
import Footer from '../../../plugins/mongo/models/footer/Footer.js';
import generateFormFields from '../../../plugins/helpers/formHelper.js';
import { buildRoutes } from '../../helpers/routeBuilder.js';
import { uploadMultiple } from '../../../plugins/multer/setup.js';
import { imagesArray } from '../../../routes/helpers/imagesArray.js';
const router = express.Router();

// Route to render the form to add a new footer
router.get('/renderAddForm', (req, res) => {
  try {
    const model = Footer.getModelFields();
    const formFields = generateFormFields(model);
    console.log('renderAddForm');

    res.render('forms/generalForm', {
      title: 'Add New Footer',
      action: '/footers/create',
      formFields: formFields,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

// Route to render the form to edit an existing footer
router.get('/renderEditForm/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const footer = await new Footer().getById(id);
    if (!footer) {
      return res.status(404).send({ error: 'Footer not found' });
    }
    const model = Footer.getModelFields();
    const formFields = generateFormFields(model, footer); // Generate form fields as an array

    res.render('forms/generalEditForm', {
      title: 'Edit Footer',
      action: `footers/update/${id}`,
      routeSub: 'footers',
      method: 'post',
      formFields: formFields,
      data: footer,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});
/////////////////
router.get('/section', async (req, res) => {
  try {
    const data = await new Footer().getAll();
    res.render('./layouts/section', {
      title: 'Section View',
      data: data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

router.post('/:id/upload-images', uploadMultiple, imagesArray(Footer), async (req, res) => {
  try {
    res.status(200).json({ message: 'Footer images uploaded and updated successfully', images: req.body.imagesArray });
  } catch (error) {
    console.error('Error processing images for Footer:', error);
    res.status(500).send('Internal Server Error');
  }
});

buildRoutes(new Footer(), router);

export default router;
