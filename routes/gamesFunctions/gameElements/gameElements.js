import express from 'express';
import GameElement from '../../../plugins/mongo/models/games/GameElement.js';
import { buildRoutes } from '../../helpers/routeBuilder.js';
import generateFormFields from '../../../plugins/helpers/formHelper.js';
const router = express.Router();

// Route to render the form to add a new game element
router.get('/renderAddForm', (req, res) => {
  try {
    const model = GameElement.getModelFields();
    const formFields = generateFormFields(model);
    res.render('forms/generalForm', {
      title: 'Add Game Element',
      action: '/games/gameElements/create',
      formFields: formFields,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

// Route to render the form to edit an existing game element
router.get('/renderEditForm/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const gameElement = await new GameElement().getById(id);
    if (!gameElement) {
      return res.status(404).send({ error: 'Game Element not found' });
    }

    const model = GameElement.getModelFields();
    const formFields = generateFormFields(model, gameElement);

    // Enhance form fields for arrays, objects, and booleans
    const enhancedFormFields = formFields.map(field => {
      if (Array.isArray(field.value)) {
        // Handle array fields
        return {
          ...field,
          type: 'array',
          value: field.value,
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
      title: `Edit Game Element`,
      action: `/games/gameElements/update/${id}`,
      routeSub: `gameElements`,
      method: 'post',
      formFields: enhancedFormFields,
      data: gameElement,
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

// Use route builder to automatically generate CRUD routes
buildRoutes(new GameElement(), router);

export default router;
