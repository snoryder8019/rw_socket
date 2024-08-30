import express from 'express';
import Event from '../../../plugins/mongo/models/calendar/Event.js';
import generateFormFields from '../../../plugins/helpers/formHelper.js';
import { buildRoutes } from '../../helpers/routeBuilder.js';

const router = express.Router();
const modelName = 'event';

// Route to render the form to add a new event
router.get('/renderAddForm', (req, res) => {
  try {
    const model = Event.getModelFields();
    const formFields = generateFormFields(model);

    res.render('forms/generalEventForm', {
      title: 'Add New Event',
      action: '/events/create',
      formFields: formFields,
      datepicker: true, // Indicate to initialize datepicker for date fields
    });
  } catch (error) {
    console.error('Error rendering add event form:', error);
    res.status(500).send({ error: error.message });
  }
});

// Route to render the form to edit an existing event
router.get('/renderEditForm/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const event = await new Event().getById(id);
    if (!event) {
      return res.status(404).send({ error: 'Event not found' });
    }
    const model = Event.getModelFields();
    const formFields = generateFormFields(model, event);

    res.render('forms/generalEditEventForm', {
      title: 'Edit Event',
      action: `/events/update/${id}`,
      routeSub: 'events',
      method: 'post',
      formFields: formFields,
      data: event,
      datepicker: true, // Indicate to initialize datepicker for date fields
    });
  } catch (error) {
    console.error('Error rendering edit event form:', error);
    res.status(500).send({ error: error.message });
  }
});

// Route to register an attendee for an event
router.post('/register/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    await new Event().registerAttendee(id, userId);
    res.status(200).send({ message: 'User registered for the event successfully.' });
  } catch (error) {
    console.error('Error registering attendee:', error);
    res.status(400).send({ error: error.message });
  }
});

// Route to unregister an attendee from an event
router.post('/unregister/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    await new Event().unregisterAttendee(id, userId);
    res.status(200).send({ message: 'User unregistered from the event successfully.' });
  } catch (error) {
    console.error('Error unregistering attendee:', error);
    res.status(400).send({ error: error.message });
  }
});

// Route to update the status of an event
router.post('/updateStatus/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    await new Event().updateEventStatus(id, status);
    res.status(200).send({ message: 'Event status updated successfully.' });
  } catch (error) {
    console.error('Error updating event status:', error);
    res.status(400).send({ error: error.message });
  }
});

// Other routes...

buildRoutes(new Event(), router);

export default router;
