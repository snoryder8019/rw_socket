import express from 'express';
import SectionSetting from '../../../plugins/mongo/models/SectionSetting.js';
import generateFormFields from '../../../plugins/helpers/formHelper.js';
import { buildRoutes } from '../../helpers/routeBuilder.js';
import {imagesArray,getImagesArray,popImagesArray,popImagesArrayIndex,updateImagesArray} from '../../helpers/imagesArray.js'
import { uploadMultiple } from '../../../plugins/multer/setup.js';
const router = express.Router();
const modelName = 'sectionSetting';
// Route to render the form to add a new section setting
router.get('/renderAddForm', (req, res) => {
  try {
    const model = SectionSetting.getModelFields();
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

// Route to render the form to edit an existing section setting
router.get('/renderEditForm/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const sectionSetting = await new SectionSetting().getById(id);
    if (!sectionSetting) {
      return res.status(404).send({ error: 'Section setting not found' });
    }

    const model = SectionSetting.getModelFields(); // This should return an object that defines field types
    const formFields = generateFormFields(model, sectionSetting); // Generate form fields as an array

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
      title: `Edit ${modelName}`,
      action: `${modelName}s/update/${id}`,
      routeSub: `${modelName}s`,
      method: 'post',
      formFields: enhancedFormFields, // Use enhanced form fields
      data: sectionSetting,
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

/////////////////
router.get('/section', async (req, res) => {
  try {
    const data = await new SectionSetting().getAll();
    res.render(`./layouts/${modelName}`, {
      title: 'Section View',
      data: data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});
router.post('/:id/upload-images',uploadMultiple, imagesArray(SectionSetting));
router.get('/renderImagesArray/:id', getImagesArray(SectionSetting))
router.get('/popImagesArray/:id/:url', popImagesArray(SectionSetting))
router.get('/popImagesArrayIndex/:id/:index', popImagesArrayIndex(SectionSetting))
buildRoutes(new SectionSetting(), router);

export default router;
