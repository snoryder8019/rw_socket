import express from 'express';
import Vote from '../../../plugins/mongo/models/blog/Vote.js';
import generateFormFields from '../../../plugins/helpers/formHelper.js';
import { buildRoutes } from '../../helpers/routeBuilder.js';

const router = express.Router();
const modelName = 'vote';

// Route to render the form to add a new vote
router.get('/renderAddForm', (req, res) => {
  try {
    const model = Vote.getModelFields();
    const formFields = generateFormFields(model);

    res.render('forms/generalForm', {
      title: 'Add New Vote',
      action: '/votes/create',
      formFields: formFields,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

// Route to render the form to edit an existing vote
router.get('/renderEditForm/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const vote = await new Vote().getById(id);
    if (!vote) {
      return res.status(404).send({ error: 'Vote not found' });
    }
    const model = Vote.getModelFields();
    const formFields = generateFormFields(model, vote);

    res.render('forms/generalEditForm', {
      title: 'Edit Vote',
      action: `/votes/update/${id}`,
      routeSub: 'votes',
      method: 'post',
      formFields: formFields,
      data: vote,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

// Other routes...

buildRoutes(new Vote(), router);

export default router;
