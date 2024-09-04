import express from 'express';
import Item from '../../../plugins/mongo/models/exchange/Item.js';
import Transaction from '../../../plugins/mongo/models/exchange/Transaction.js';
import generateFormFields from '../../../plugins/helpers/formHelper.js';
import { buildRoutes } from '../../helpers/routeBuilder.js';
import { uploadMultiple } from '../../../plugins/multer/setup.js';
import { imagesArray } from '../../../routes/helpers/imagesArray.js';

const router = express.Router();

// Route to render the form to add a new item
router.get('/items/renderAddForm', (req, res) => {
  try {
    const model = Item.getModelFields();
    const formFields = generateFormFields(model);
    console.log('renderAddForm for Item');

    res.render('forms/generalForm', {
      title: 'Add New Item',
      action: '/items/create',
      formFields: formFields,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

// Route to render the form to edit an existing item
router.get('/items/renderEditForm/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const item = await new Item().getById(id);
    if (!item) {
      return res.status(404).send({ error: 'Item not found' });
    }

    const model = Item.getModelFields();
    const formFields = generateFormFields(model, item);

    // Enhance form fields for different data types
    const enhancedFormFields = formFields.map(field => {
      if (Array.isArray(field.value)) {
        return {
          ...field,
          type: 'array',
          value: field.value,
        };
      } else if (typeof field.value === 'object' && field.value !== null) {
        return {
          ...field,
          type: 'object',
          value: Object.entries(field.value).map(([key, val]) => ({
            key,
            val,
          })),
        };
      } else if (typeof field.value === 'boolean') {
        return {
          ...field,
          type: 'boolean',
          value: field.value,
        };
      }
      return field;
    });

    res.render('forms/generalEditForm', {
      title: `Edit Item`,
      action: `/items/update/${id}`,
      routeSub: `items`,
      method: 'post',
      formFields: enhancedFormFields,
      data: item,
      script: `<script>
          document.addEventListener('DOMContentLoaded', function () {
            console.log('Page-specific JS loaded for Edit Form');
          });
        </script>`
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

// Route to render the form to add a new transaction
router.get('/transactions/renderAddForm', (req, res) => {
  try {
    const model = Transaction.getModelFields();
    const formFields = generateFormFields(model);
    console.log('renderAddForm for Transaction');

    res.render('forms/generalForm', {
      title: 'Add New Transaction',
      action: '/transactions/create',
      formFields: formFields,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

// Route to render the form to edit an existing transaction
router.get('/transactions/renderEditForm/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const transaction = await new Transaction().getById(id);
    if (!transaction) {
      return res.status(404).send({ error: 'Transaction not found' });
    }

    const model = Transaction.getModelFields();
    const formFields = generateFormFields(model, transaction);

    // Enhance form fields for different data types
    const enhancedFormFields = formFields.map(field => {
      if (Array.isArray(field.value)) {
        return {
          ...field,
          type: 'array',
          value: field.value,
        };
      } else if (typeof field.value === 'object' && field.value !== null) {
        return {
          ...field,
          type: 'object',
          value: Object.entries(field.value).map(([key, val]) => ({
            key,
            val,
          })),
        };
      } else if (typeof field.value === 'boolean') {
        return {
          ...field,
          type: 'boolean',
          value: field.value,
        };
      }
      return field;
    });

    res.render('forms/generalEditForm', {
      title: `Edit Transaction`,
      action: `/transactions/update/${id}`,
      routeSub: `transactions`,
      method: 'post',
      formFields: enhancedFormFields,
      data: transaction,
      script: `<script>
          document.addEventListener('DOMContentLoaded', function () {
            console.log('Page-specific JS loaded for Edit Form');
          });
        </script>`
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

// Route to render the section view for items
router.get('/items/section', async (req, res) => {
  try {
    const data = await new Item().getAll();
    res.render('./layouts/section', {
      title: 'Items Section View',
      data: data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

// Route to render the section view for transactions
router.get('/transactions/section', async (req, res) => {
  try {
    const data = await new Transaction().getAll();
    res.render('./layouts/section', {
      title: 'Transactions Section View',
      data: data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

// Route to handle uploading images for items
router.post('/items/:id/upload-images', uploadMultiple, imagesArray(Item), async (req, res) => {
  try {
    res.status(200).json({ message: 'Item images uploaded and updated successfully', images: req.body.imagesArray });
  } catch (error) {
    console.error('Error processing images for Item:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Route to handle uploading images for transactions
router.post('/transactions/:id/upload-images', uploadMultiple, imagesArray(Transaction), async (req, res) => {
  try {
    res.status(200).json({ message: 'Transaction images uploaded and updated successfully', images: req.body.imagesArray });
  } catch (error) {
    console.error('Error processing images for Transaction:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Automatically generate CRUD routes for Items and Transactions
buildRoutes(new Item(), router);
buildRoutes(new Transaction(), router);

export default router;
