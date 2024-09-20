// routes/adminFunctions/tickets/tickets.js
import express from 'express';
import Ticket from '../../../plugins/mongo/models/Ticket.js';
import generateFormFields from '../../../plugins/helpers/formHelper.js';
import { buildRoutes } from '../../helpers/routeBuilder.js';
import { uploadMultiple } from '../../../plugins/multer/setup.js';
const router = express.Router();

// Route to render the form to add a new ticket
router.get('/renderAddForm', (req, res) => {
  try {
    const model = Ticket.getModelFields();
    const formFields = generateFormFields(model);
    console.log('renderAddForm');

    res.render('forms/generalForm', {
      title: 'Add New Ticket',
      action: '/tickets/create',
      formFields: formFields,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

// Route to render the form to edit an existing ticket
router.get('/renderEditForm/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const ticket = await new Ticket().getById(id);
    if (!ticket) {
      return res.status(404).send({ error: 'Ticket not found' });
    }

    const model = Ticket.getModelFields();
    const formFields = generateFormFields(model, ticket);

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
      title: `Edit Ticket`,
      action: `tickets/update/${id}`,
      routeSub: `tickets`,
      method: 'post',
      formFields: enhancedFormFields,
      data: ticket,
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

// Section view for tickets
router.get('/section', async (req, res) => {
  try {
    const data = await new Ticket().getAll();
    res.render('./layouts/section', {
      title: 'Section View',
      data: data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

// Route to upload attachments for a ticket
router.post('/:id/upload-attachments', uploadMultiple, async (req, res) => {
  try {
    res.status(200).json({ message: 'Ticket attachments uploaded and updated successfully', attachments: req.body.attachments });
  } catch (error) {
    console.error('Error processing attachments for Ticket:', error);
    res.status(500).send('Internal Server Error');
  }
});

buildRoutes(new Ticket(), router);

export default router;
