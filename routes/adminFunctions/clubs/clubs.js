const express = require('express');
const Club = require('../../../plugins/mongo/models/Club');
const { generateFormFields } = require('../../../plugins/helpers/formHelper');
const buildRoutes = require('../../helpers/routeBuilder');

const router = express.Router();

// Route to render the form to add a new club
router.get('/renderAddForm', (req, res) => {
  try {
    const model = [
      { name: 'name', type: 'text' },
      { name: 'authTitle', type: 'text' },
      { name: 'nonAuthTitle', type: 'text' },
      { name: 'authSubtitle', type: 'text' },
      { name: 'nonAuthSubtitle', type: 'text' },
      { name: 'authDescription', type: 'textarea' },
      { name: 'nonAuthDescription', type: 'textarea' },
      { name: 'price', type: 'number' },
      { name: 'subLength', type: 'number' },
      { name: 'creationDate', type: 'date' },
      { name: 'mediumIcon', type: 'file' },
      { name: 'squareNonAuthBkgd', type: 'file' },
      { name: 'squareAuthBkgd', type: 'file' },
      { name: 'horizNonAuthBkgd', type: 'file' },
      { name: 'horizAuthBkgd', type: 'file' },
      { name: 'entryUrl', type: 'text' },
      { name: 'entryText', type: 'text' },
      { name: 'updatedDate', type: 'date' },
      { name: 'status', type: 'text' },
      { name: 'visible', type: 'boolean' },
      { name: 'tags', type: 'text' },  // Assuming comma-separated string for simplicity
      { name: 'links', type: 'text' },  // Assuming comma-separated string for simplicity
      { name: 'blogs', type: 'text' },  // Assuming comma-separated string for simplicity
      { name: 'vendors', type: 'text' },  // Assuming comma-separated string for simplicity
      { name: 'members', type: 'text' }  // Assuming comma-separated string for simplicity
    ];

    const formFields = generateFormFields(model);

    res.render('forms/generalForm', {
      title: 'Add New Club',
      action: '/clubs/create',
      formFields: formFields
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

buildRoutes(new Club(), router);

module.exports = router;
