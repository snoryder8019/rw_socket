import express from 'express';
import { getDb } from '../../../plugins/mongo/mongo.js';
import User from '../../../plugins/mongo/models/User.js';
import Permission from '../../../plugins/mongo/models/Permission.js';
import { buildRoutes } from '../../helpers/routeBuilder.js';
import generateFormFields from '../../../plugins/helpers/formHelper.js';

const router = express.Router();

////////Version 1 Functions
const modelName = 'user';
// Route to render the form to add a new user
router.get('/renderAddForm', (req, res) => {
  try {
    const model = User.getModelFields();
    const formFields = generateFormFields(model);
    console.log('renderAddForm');

    res.render('forms/generalForm', {
      title: 'Add New User',
      action: '/users/create',
      formFields: formFields,
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
    const permissionsModel = new Permission().modelFields; // Ensure this is defined and returns an object
    if (!permissionsModel) {
      throw new Error('Permissions model is undefined or null');
    }

    const user = await new User().getById(id);
    if (!user) {
      return res.status(404).send({ error: 'User not found' });
    }

    // Ensure user.permissions is an object
    const userPermissions = user.permissions || {};

    const model = User.getModelFields();
    const formFields = generateFormFields(model, user); // Generate form fields as an array

    // Generate form fields for permissions
    const permissionsFields = Object.keys(permissionsModel).map(
      (permissionKey) => {
        return {
          name: `permissions[${permissionKey}]`,
          label: permissionKey,
          type: 'boolean',
          value: userPermissions[permissionKey] || false,
        };
      }
    );

    res.render('forms/generalEditForm', {
      title: 'Edit User',
      action: `users/update/${id}`,
      routeSub: 'users',
      method: 'post',
      formFields: formFields, // Keep the original form fields separate
      permissionsFields: permissionsFields, // Handle permissions fields separately in the template
      data: user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});
router.get('/usersAvatars', async (req, res) => {
  try {
    // Use a simple filter query with getAll to find users with at least one image that has avatarTag: true
    const documents = await new User().getAll({
      "images.avatarTag": true // Query where any image in the array has avatarTag: true
    });

    // Extract the thumbnailUrl from the images where avatarTag is true
    const avatarUrls = documents.flatMap(doc =>
      doc.images
        .filter(image => image.avatarTag === true) // Filter only images with avatarTag: true
        .map(image => image.thumbnailUrl) // Map to thumbnailUrl
    );

    // Shuffle the array to get random avatars
    const shuffledAvatarUrls = avatarUrls.sort(() => Math.random() - 0.5);

    // Return a maximum of 25 avatar URLs
    const limitedAvatarUrls = shuffledAvatarUrls.slice(0, 25);

    res.send(limitedAvatarUrls); // Send the array of thumbnail URLs
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});


//////
router.get('/section', async (req, res) => {
  try {
    const data = await new User().getAll();
    res.render('./layouts/section', {
      title: 'Section View',
      data: data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

router.get('/getSearchForm', async (req, res) => {
  try {
    const users = await new User().getAll();
    console.log('getting Users Search');
    res.render('./forms/generalSearchForm', {
      users: users,
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

    const userHtml = users
      .map(
        (user) => `
      <div class="user">
        <p>${user.firstName}</p>
        <p>${user.lastName}</p>
        <p>${user.email}</p>
        <p><button>contact</button></p>
        <p><button data-url="/users/edit">edit</button></p>
      </div>
    `
      )
      .join('');

    const paginationHtml = Array.from(
      { length: totalPages },
      (_, i) => `
      <a href="#" data-page="${i + 1}" ${i + 1 === parseInt(page) ? 'style="font-weight:bold"' : ''}>${i + 1}</a>
    `
    ).join(' ');

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
    res
      .status(500)
      .send({ error: 'An error occurred while fetching user data' });
  }
});
//This pulls the views/partials/actionButtons
router.post('/actions', async(req, res) => {
  try {
      const { userId } = req.body;
const user = await new User().getById(userId)
      if (!userId) {
          return res.status(400).json({ error: 'User ID is missing' });
      }

      // Simulating fetching an array of actions
      const actionsArray = [
        'notification', 
        'email', 
        'permission',
        'subscription', 
        'club', 
        'gem', 
        'register', 
        'ban', 
      ]; // Could be dynamic
      res.render('partials/actionsButtons', { actionsArray, user });  } catch (error) {
      console.error('Server error:', error);
      return res.status(500).json({ error: 'Internal server error' });
  }
});
//USER ACTIONS EXECUTE
router.post('/userAction', async (req, res) => {
  try {
      const { action, userId } = req.body;
      const modelName = action.charAt(0).toUpperCase() + action.slice(1);
      let Model, modelArray;

      // Bypass dynamic model import for specific actions
      if (action === 'ban' || action === 'email' || action === 'register') {
          modelArray = []; // Set modelArray as an empty array or a specific value if needed
      } else {
          try {
              // Try importing with the action directory
              const moduleWithAction = await import(`../../../plugins/mongo/models/${action}s/${modelName}.js`);
              Model = moduleWithAction.default;
          } catch (error) {
              if (error.code === 'ERR_MODULE_NOT_FOUND') {
                  // Fallback to the base directory if file is not found
                  const moduleWithoutAction = await import(`../../../plugins/mongo/models/${modelName}.js`);
                  Model = moduleWithoutAction.default;
              } else {
                  throw error; // Re-throw if it's a different error
              }
          }
          modelArray = await new Model().getAll();
      }

      console.log(modelArray);

      const user = await new User().getById(userId);
      console.log(user.displayName);

      res.render(`admin/users/actionTemplates/${action}`, { data: req.body, selectedUser: user });
  } catch (error) {
      console.error('Error rendering user action:', error);
      res.status(500).send('Error rendering template');
  }
});







export default router;
