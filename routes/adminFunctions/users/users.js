const express = require('express');
const router = express.Router();
const User = require('../../../plugins/mongo/models/User')
const { getDb } = require('../../../plugins/mongo/mongo');
const buildRoutes = require('../../helpers/routeBuilder');
const { generateFormFields } = require('../../../plugins/helpers/formHelper');

////////Version 1 Functions
const modelName = "user";
// Route to render the form to add a new user
router.get('/renderAddForm', (req, res) => {
  try {
    const model = User.getModelFields();
    const formFields = generateFormFields(model);
    console.log('renderAddForm');

    res.render('forms/generalForm', {
      title: 'Add New User',
      action: '/users/create',
      formFields: formFields
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

// Route to render the form to edit an existing user
router.get('/renderEditForm/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await new User().getById(id);
    if (!user) {
      return res.status(404).send({ error: 'User not found' });
    }
    const model = User.getModelFields();
    const formFields = generateFormFields(model, user); // Generate form fields as an array

    res.render('forms/generalEditForm', {
      title: 'Edit User',
      action: `users/update/${id}`,
      routeSub: 'users',
      method: 'post',
      formFields: formFields,
      data: user
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});
/////////////////
router.get('/section', async (req, res) => {
  try {
    const data = await new User().getAll();
    res.render('./layouts/section', {
      title: 'Section View',
      data: data
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

buildRoutes(new User(), router);




//////// VERSION 0.9 functions
router.get('/paginateUsers', async (req, res) => {
  try {
    const db = getDb();
    const usersCollection = db.collection('users');

    const { page = 1, limit = 10, email, firstName, lastName } = req.query;
    const query = {};

    if (email) {
      query.email = { $regex: email, $options: 'i' };
    }
    if (firstName) {
      query.firstName = { $regex: firstName, $options: 'i' };
    }
    if (lastName) {
      query.lastName = { $regex: lastName, $options: 'i' };
    }

    const options = {
      projection: { firstName: 1, lastName: 1, email: 1 },
      skip: (parseInt(page) - 1) * parseInt(limit),
      limit: parseInt(limit),
    };

    const users = await usersCollection.find(query, options).toArray();
    const totalUsers = await usersCollection.countDocuments(query);
    const totalPages = Math.ceil(totalUsers / parseInt(limit));

    const userHtml = users.map(user => `
      <div class="user">
        <p>${user.firstName}</p>
        <p>${user.lastName}</p>
        <p>${user.email}</p>
        <p><button>contact</button></p>
        <p><button data-url="/users/edit">edit</button></p>
      </div>
    `).join('');

    const paginationHtml = Array.from({ length: totalPages }, (_, i) => `
      <a href="#" data-page="${i + 1}" ${i + 1 === parseInt(page) ? 'style="font-weight:bold"' : ''}>${i + 1}</a>
    `).join(' ');

    const filterFormHtml = `
      <form id="filterForm">
        <input type="text" name="email" placeholder="Email" value="${email || ''}">
        <input type="text" name="firstName" placeholder="First Name" value="${firstName || ''}">
        <input type="text" name="lastName" placeholder="Last Name" value="${lastName || ''}">
        <button type="submit">Filter</button>
      </form>
    `;

    res.send(`
      ${filterFormHtml}
      <div id="userList">
        ${userHtml}
      </div>
      <div id="pagination">
        ${paginationHtml}
      </div>
      <script>
        document.addEventListener('DOMContentLoaded', () => {
          const filterForm = document.getElementById('filterForm');
          const pagination = document.getElementById('pagination');

          filterForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const formData = new FormData(filterForm);
            const query = new URLSearchParams(formData).toString();
            fetch('/paginateUsers?' + query)
              .then(response => response.text())
              .then(html => {
                document.querySelector('.content').innerHTML = html;
              })
              .catch(error => console.error('Error fetching user data:', error));
          });

          pagination.addEventListener('click', function(event) {
            if (event.target.tagName === 'A') {
              event.preventDefault();
              const page = event.target.getAttribute('data-page');
              const formData = new FormData(filterForm);
              formData.append('page', page);
              const query = new URLSearchParams(formData).toString();
              fetch('/paginateUsers?' + query)
                .then(response => response.text())
                .then(html => {
                  document.querySelector('.content').innerHTML = html;
                })
                .catch(error => console.error('Error fetching user data:', error));
            }
          });
        });
      </script>
    `);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'An error occurred while fetching user data' });
  }
});

module.exports = router;
