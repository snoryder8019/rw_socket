import express from 'express';
import Transaction from '../../../plugins/mongo/models/exchange/Transaction.js';
import generateFormFields from '../../../plugins/helpers/formHelper.js';
import { buildRoutes } from '../../helpers/routeBuilder.js';

const router = express.Router();
const modelName = 'transaction';

// Route to render the form to add a new transaction
router.get('/renderAddForm', (req, res) => {
  try {
    const model = Transaction.getModelFields();
    const formFields = generateFormFields(model);

    res.render('forms/generalForm', {
      title: 'Add New Transaction',
      action: '/transactions/create',
      formFields: formFields,
    });
  } catch (error) {
    console.error('Error rendering add transaction form:', error);
    res.status(500).send({ error: error.message });
  }
});

// Route to render the form to edit an existing transaction
router.get('/renderEditForm/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const transaction = await new Transaction().getById(id);
    if (!transaction) {
      return res.status(404).send({ error: 'Transaction not found' });
    }
    const model = Transaction.getModelFields();
    const formFields = generateFormFields(model, transaction);

    res.render('forms/generalEditForm', {
      title: 'Edit Transaction',
      action: `/transactions/update/${id}`,
      routeSub: 'transactions',
      method: 'post',
      formFields: formFields,
      data: transaction,
    });
  } catch (error) {
    console.error('Error rendering edit transaction form:', error);
    res.status(500).send({ error: error.message });
  }
});

// Route to update the status of a transaction
router.post('/updateStatus/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    await new Transaction().updateTransactionStatus(id, status);
    res.status(200).send({ message: 'Transaction status updated successfully.' });
  } catch (error) {
    console.error('Error updating transaction status:', error);
    res.status(400).send({ error: error.message });
  }
});

// Other routes...

buildRoutes(new Transaction(), router);

export default router;
