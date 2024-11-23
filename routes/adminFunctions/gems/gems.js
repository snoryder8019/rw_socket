import express from 'express';
import Gem from '../../../plugins/mongo/models/Gem.js';
import Users from '../../../plugins/mongo/models/User.js'
import generateFormFields from '../../../plugins/helpers/formHelper.js';
import { buildRoutes } from '../../helpers/routeBuilder.js';

const router = express.Router();
const modelName = 'gem';
// Route to render the form to add a new gem
router.get('/renderAddForm', (req, res) => {
  try {
    const model = Gem.getModelFields();
    const formFields = generateFormFields(model);
    console.log('renderAddForm');

    res.render('forms/generalForm', {
      title: 'Add New gem',
      action: '/gems/create',
      formFields: formFields,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

// Route to render the form to edit an existing gem
router.get('/renderEditForm/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const gem = await new Gem().getById(id);
    if (!gem) {
      return res.status(404).send({ error: 'Gem not found' });
    }
    const model = Gem.getModelFields();
    const formFields = generateFormFields(model, gem); // Generate form fields as an array

    res.render('forms/generalEditForm', {
      title: 'Edit Gem',
      action: `gems/update/${id}`,
      routeSub: 'gems',
      method: 'post',
      formFields: formFields,
      data: gem,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});
/////////////////
router.get('/section', async (req, res) => {
  try {
    const data = await new Gem().getAll();
    res.render('./layouts/section', {
      title: 'Section View',
      data: data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});
router.post('/giftGems', async (req, res) => {
  try {
    console.log('Received giftGems request:', req.body);

    const { recipientId, selectedData, quantity } = req.body;
    const addedQuantity = parseInt(quantity, 10);
    const gemType = selectedData.toLowerCase(); // Convert to lowercase to match field names
    console.log(`Parsed values - recipientId: ${recipientId}, gemType: ${gemType}, quantity: ${addedQuantity}`);

    // Check user data for the current wallet status
    const userData = await new Users().getById(recipientId);
    console.log('User data before update:', userData);

    // Construct the dynamic path for the gem type within wallet
    const gemFieldPath = `wallet.${gemType}`;
    console.log(`Constructed gem field path for update: ${gemFieldPath}`);

    // Use the new updateByIncDec function to increment the gem quantity
    const result = await new Users().updateByIncDec(recipientId, gemFieldPath, addedQuantity);
    console.log('Result of updateByIncDec:', result);

    // Check if the update was successful
    if (!result || result.modifiedCount === 0) {
      console.warn('No changes detected or update failed.');
      return res.status(500).send('Failed to update user wallet or no changes detected');
    }

    // Fetch updated user data for verification
    const updatedUserData = await new Users().getById(recipientId);
    console.log('User data after update:', updatedUserData);

    console.log(`Successfully gifted ${addedQuantity} gems of type ${gemType} to user ${recipientId}`);
    res.status(200).send({ message: `Successfully gifted ${addedQuantity} gems of type ${gemType}` });
  } catch (error) {
    console.error('Error occurred in giftGems route:', error);
    res.status(500).send({ error: 'Failed to gift gems' });
  }
});


buildRoutes(new Gem(), router);

export default router;
