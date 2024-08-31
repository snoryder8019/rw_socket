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

    res.render('forms/generalForm', {
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

    const model = Event.getModelFields(); // This should return an object that defines field types
    const formFields = generateFormFields(model, event); // Generate form fields as an array

    // Iterate over form fields to ensure proper handling for arrays, objects, booleans
    const enhancedFormFields = formFields.map(field => {
      if (Array.isArray(field.value)) {
        // Handle array fields
        return {
          ...field,
          type: 'array',
          value: field.value, // Array of values to be iterated in the form
        };
      } else if (typeof field.value === 'object' && field.value !== null) {
        // Handle object fields
        return {
          ...field,
          type: 'object',
          value: Object.entries(field.value).map(([key, val]) => ({
            key,
            val,
          })),
        };
      } else if (typeof field.value === 'boolean') {
        // Handle boolean fields
        return {
          ...field,
          type: 'boolean',
          value: field.value,
        };
      }
      // Handle other types (string, number, etc.)
      return field;
    });

    res.render('forms/generalEditForm', {
      title: `Edit Event`,
      action: `events/update/${id}`,
      routeSub: `events`,
      method: 'post',
      formFields: enhancedFormFields, // Use enhanced form fields
      data: event,
      script:`<script>
          document.addEventListener('DOMContentLoaded', function () {
            // Your dynamic JS code here
            console.log('Page-specific JS loaded for Edit Form');
          });
        </script>`
    });
  } catch (error) {
    console.error(error);
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
