import express from 'express';
import GameSetting from '../../../plugins/mongo/models/games/GameSetting.js';
import generateFormFields from '../../../plugins/helpers/formHelper.js';
import { buildRoutes } from '../../helpers/routeBuilder.js';

const router = express.Router();
const modelName = 'gameSetting';

// Route to render the form to add a new game setting
router.get('/renderAddForm', (req, res) => {
  try {
    const model = GameSetting.getModelFields();
    const formFields = generateFormFields(model);
    console.log('renderAddForm');

    res.render('forms/generalForm', {
      title: 'Game Setting',
      action: '/games/gameSettings/create',
      formFields: formFields,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

// Route to render the form to edit an existing game setting
router.get('/renderEditForm/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const gameSetting = await new GameSetting().getById(id);
    if (!gameSetting) {
      return res.status(404).send({ error: 'Game Setting not found' });
    }

    const model = GameSetting.getModelFields();
    const formFields = generateFormFields(model, gameSetting);

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
      title: `Edit Game Setting`,
      action: `/games/gameSettings/update/${id}`,
      routeSub: `gameSettings`,
      method: 'post',
      formFields: enhancedFormFields,
      data: gameSetting,
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
buildRoutes(new GameSetting(), router);

export default router;
