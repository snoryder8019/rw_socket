import express from 'express';
import Faq from '../../../plugins/mongo/models/help/Faq.js';
import generateFormFields from '../../../plugins/helpers/formHelper.js';
import { buildRoutes } from '../../helpers/routeBuilder.js';
const router = express.Router();

// Route to render the form to add a new FAQ
router.get('/renderAddForm', (req, res) => {
  try {
    const model = Faq.getModelFields();
    const formFields = generateFormFields(model);

    res.render('forms/generalForm', {
      title: 'Create New FAQ',
      action: '/faqs/create',
      formFields: formFields,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

// Route to render the form to edit an existing FAQ
router.get('/renderEditForm/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const faq = await new Faq().getById(id);
    if (!faq) {
      return res.status(404).send({ error: 'FAQ not found' });
    }
    const model = Faq.getModelFields();
    const formFields = generateFormFields(model, faq);

    res.render('forms/generalEditForm', {
      title: 'Edit FAQ',
      action: `faqs/update/${id}`,
      formFields: formFields,
      routeSub:"faqs",
      data: faq,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

// Route to list all FAQs

buildRoutes(new Faq(), router);

export default router;
