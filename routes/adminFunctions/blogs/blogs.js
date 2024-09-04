#!/usr/bin/env node
//Reference: /adminFunctions/blogs/blogs.js
import express from 'express';
import Blog from '../../../plugins/mongo/models/blog/Blog.js';
import generateFormFields from '../../../plugins/helpers/formHelper.js';
import {imagesArray,getImagesArray,popImagesArray,popImagesArrayIndex,updateImagesArray} from '../../helpers/imagesArray.js'
import { uploadMultiple } from '../../../plugins/multer/setup.js';

import { buildRoutes } from '../../helpers/routeBuilder.js';

const router = express.Router();
const modelName = 'blog';

// Route to render the form to add a new blog
router.get('/renderAddForm', (req, res) => {
  try {
    const model = Blog.getModelFields();
    const formFields = generateFormFields(model);

    res.render('forms/generalBlogForm', {
      title: 'Add New Blog',
      action: '/blogs/create',
      formFields: formFields,
      wysiwyg: true, // Indicate to initialize WYSIWYG editor
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

// Route to render the form to edit an existing blog
router.get('/renderEditForm/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await new Blog().getById(id);
    if (!blog) {
      return res.status(404).send({ error: 'Blog not found' });
    }

    const model = Blog.getModelFields(); // This should return an object that defines field types
    const formFields = generateFormFields(model, blog); // Generate form fields as an array

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
      title: `Edit Blog`,
      action: `blogs/update/${id}`,
      routeSub: `blogs`,
      method: 'post',
      formFields: enhancedFormFields, // Use enhanced form fields
      data: blog,
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


// Other routes...
router.post('/:id/upload-images',uploadMultiple, imagesArray(Blog));
router.get('/renderImagesArray/:id', getImagesArray(Blog))
router.get('/popImagesArray/:id/:url', popImagesArray(Blog))
router.get('/popImagesArrayIndex/:id/:index', popImagesArrayIndex(Blog))
buildRoutes(new Blog(), router);

export default router;
