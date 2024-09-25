import express from 'express';
import Notification from '../../../plugins/mongo/models/notifications/Notification.js';
import generateFormFields from '../../../plugins/helpers/formHelper.js';
import { buildRoutes } from '../../helpers/routeBuilder.js';
import GameLog from '../../../plugins/mongo/models/games/GameLog.js';
const router = express.Router();
const modelName = 'notification';

// Route to render the form to add a new notification
router.get('/renderAddForm', (req, res) => {
  try {
    const model = Notification.getModelFields();
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

// Route to render the form to edit an existing notification
router.get('/renderEditForm/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await new Notification().getById(id);
    if (!notification) {
      return res.status(404).send({ error: 'Notification not found' });
    }
    const model = Notification.getModelFields();
    const formFields = generateFormFields(model, notification); // Generate form fields as an array
    res.render('forms/generalEditForm', {
      title: `Edit ${modelName}`,
      action: `${modelName}s/update/${id}`,
      routeSub: `${modelName}s`,
      method: 'post',
      formFields: formFields,
      data: notification,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

// Route to load notifications section
router.get('/section', async (req, res) => {
  try {
    const data = await new Notification().getAll();
    res.render(`./layouts/${modelName}`, {
      title: 'Notification View',
      data: data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

// Route for initial load of the /notifications endpoint
router.get('/', async (req, res) => {
  try {
    const user = req.user; // Assuming user is attached to req (e.g., via session or JWT)
    const notifications = await new Notification().getAll({ recipientId: user._id });

    res.render('userDash/notifications', {
      title: 'Your Notifications',
      user: user,
      notifications: notifications,
    });
  } catch (error) {
    console.error('Error loading notifications:', error);
    res.status(500).send({ error: error.message });
  }
});

buildRoutes(new Notification(), router);

export default router;
