import express from 'express';
import Ticket from '../../../plugins/mongo/models/Ticket.js';
import generateFormFields from '../../../plugins/helpers/formHelper.js';
import { buildRoutes } from '../../helpers/routeBuilder.js';
import { uploadMultiple } from '../../../plugins/multer/setup.js';
import { imagesArray } from '../../../routes/helpers/imagesArray.js';
const router = express.Router();

// Route to render the form to add a new ticket
router.get('/renderAddForm', (req, res) => {
  try {
    const model = Ticket.getModelFields();
    const formFields = generateFormFields(model);

    res.render('forms/generalForm', {
      title: 'Create New Ticket',
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
    const formFields = generateFormFields(model, ticket); // Generate form fields as an array

    res.render('forms/generalEditForm', {
      title: 'Edit Ticket',
      action: `tickets/update/${id}`,
      routeSub: 'tickets',
      method: 'post',
      formFields: formFields,
      data: ticket,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

// Route to handle ticket creation
router.post('/create', uploadMultiple, async (req, res) => {
  try {
    const newTicket = new Ticket(req.body);
    await newTicket.save();
    res.redirect('/tickets/all');
  } catch (error) {
    console.error('Error creating ticket:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Route to handle ticket updates
router.post('/update/:id', uploadMultiple, async (req, res) => {
  try {
    const { id } = req.params;
    const ticket = await new Ticket().updateById(id, req.body);
    if (!ticket) {
      return res.status(404).send({ error: 'Ticket not found' });
    }
    res.redirect('/tickets/all');
  } catch (error) {
    console.error('Error updating ticket:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Route to list all tickets
router.get('/all', async (req, res) => {
  try {
    const tickets = await new Ticket().getAll();
    res.render('admin/tickets/list', { title: 'All Tickets', tickets: tickets });
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).send('Internal Server Error');
  }
});

buildRoutes(new Ticket(), router);

export default router;
