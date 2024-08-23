const express = require('express');
const Blog = require('../../../plugins/mongo/models/Blog');
const { generateFormFields } = require('../../../plugins/helpers/formHelper');
const buildRoutes = require('../../helpers/routeBuilder');
const router = express.Router();
const modelName = "blog";

// Route to render the form to add a new blog
router.get('/renderAddForm', (req, res) => {
  try {
    const model = Blog.getModelFields();
    const formFields = generateFormFields(model);
    console.log('renderAddForm');

    res.render('forms/generalForm', {
      title: 'Add New Blog',
      action: '/blogs/create',
      formFields: formFields
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
    const model = Blog.getModelFields();
    const formFields = generateFormFields(model, blog); // Generate form fields as an array

    res.render('forms/generalEditForm', {
      title: 'Edit Blog',
      action: `/blogs/update/${id}`,
      routeSub: 'blogs',
      method: 'post',
      formFields: formFields,
      data: blog
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

// Route to render a section view of blogs
router.get('/section', async (req, res) => {
  try {
    const data = await new Blog().getAll();
    res.render('./layouts/section', {
      title: 'Section View',
      data: data
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

// Automatically build the standard CRUD routes for Blog
buildRoutes(new Blog(), router);

module.exports = router;
