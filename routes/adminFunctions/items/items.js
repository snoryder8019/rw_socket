import express from 'express';
import Item from '../../../plugins/mongo/models/exchange/Item.js';
import generateFormFields from '../../../plugins/helpers/formHelper.js';
import { buildRoutes } from '../../helpers/routeBuilder.js';

const router = express.Router();
const modelName = 'item';

// Route to render the form to add a new item
router.get('/renderAddForm', (req, res) => {
  try {
    const model = Item.getModelFields();
    const formFields = generateFormFields(model);

    res.render('forms/generalForm', {
      title: 'Add New Item',
      action: '/items/create',
      formFields: formFields,
      fileUpload: true, // Indicate to initialize file upload for images
    });
  } catch (error) {
    console.error('Error rendering add item form:', error);
    res.status(500).send({ error: error.message });
  }
});

// Route to render the form to edit an existing item
router.get('/renderEditForm/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const item = await new Item().getById(id);
    if (!item) {
      return res.status(404).send({ error: 'Item not found' });
    }
    const model = Item.getModelFields();
    const formFields = generateFormFields(model, item);

    res.render('forms/generalEditForm', {
      title: 'Edit Item',
      action: `/items/update/${id}`,
      routeSub: 'items',
      method: 'post',
      formFields: formFields,
      data: item,
      fileUpload: true, // Indicate to initialize file upload for images
    });
  } catch (error) {
    console.error('Error rendering edit item form:', error);
    res.status(500).send({ error: error.message });
  }
});

// Other routes...

buildRoutes(new Item(), router);

export default router;
