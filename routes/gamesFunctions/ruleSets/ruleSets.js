import express from 'express';
import RuleSet from '../../../plugins/mongo/models//games/RuleSet.js';
import generateFormFields from '../../../plugins/helpers/formHelper.js';
import { buildRoutes } from '../../helpers/routeBuilder.js';
import { imagesArray, getImagesArray, popImagesArray, popImagesArrayIndex, updateImagesArray } from '../../helpers/imagesArray.js';
import { uploadMultiple } from '../../../plugins/multer/setup.js';

const router = express.Router();
const modelName = 'ruleSet';

// Route to render the form to add a new rule set
router.get('/renderAddForm', (req, res) => {
  try {
    const model = RuleSet.getModelFields();
    const formFields = generateFormFields(model);
    console.log('renderAddForm');

    res.render('forms/generalForm', {
      title: `Add New ${modelName}`,
      action: `/games/${modelName}s/create`,
      formFields: formFields,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

// Route to render the form to edit an existing rule set
router.get('/renderEditForm/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const ruleSet = await new RuleSet().getById(id);
    if (!ruleSet) {
      return res.status(404).send({ error: 'Rule set not found' });
    }

    const model = RuleSet.getModelFields();
    const formFields = generateFormFields(model, ruleSet);

    // Enhance form fields to handle arrays, objects, booleans, etc.
    const enhancedFormFields = formFields.map(field => {
      if (Array.isArray(field.value)) {
        return {
          ...field,
          type: 'array',
          value: field.value,
        };
      } else if (typeof field.value === 'object' && field.value !== null) {
        return {
          ...field,
          type: 'object',
          value: Object.entries(field.value).map(([key, val]) => ({
            key,
            val,
          })),
        };
      } else if (typeof field.value === 'boolean') {
        return {
          ...field,
          type: 'boolean',
          value: field.value,
        };
      }
      return field;
    });

    res.render('forms/generalEditForm', {
      title: `Edit ${modelName}`,
      action: `/games/${modelName}s/update/${id}`,
      routeSub: `${modelName}s`,
      method: 'post',
      formFields: enhancedFormFields,
      data: ruleSet,
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

// Route to view all rule sets in a section
router.get('/section', async (req, res) => {
  try {
    const data = await new RuleSet().getAll();
    res.render(`./layouts/${modelName}`, {
      title: 'Section View',
      data: data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

// Route to handle multiple image uploads
router.post('/:id/upload-images', uploadMultiple, imagesArray(RuleSet));

// Routes to handle image array operations
router.get('/renderImagesArray/:id', getImagesArray(RuleSet));
router.get('/popImagesArray/:id/:url', popImagesArray(RuleSet));
router.get('/popImagesArrayIndex/:id/:index', popImagesArrayIndex(RuleSet));

// Use route builder to automatically generate CRUD routes
buildRoutes(new RuleSet(), router);

export default router;
