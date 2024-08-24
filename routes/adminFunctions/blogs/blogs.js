import express from 'express';
import Blog from '../../../plugins/mongo/models/blog/Blog.js';
import generateFormFields from '../../../plugins/helpers/formHelper.js';
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
    const model = Blog.getModelFields();
    const formFields = generateFormFields(model, blog);

    res.render('forms/generalEditBlogForm', {
      title: 'Edit Blog',
      action: `/blogs/update/${id}`,
      routeSub: 'blogs',
      method: 'post',
      formFields: formFields,
      data: blog,
      wysiwyg: true, // Indicate to initialize WYSIWYG editor
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

// Other routes...

buildRoutes(new Blog(), router);

export default router;
