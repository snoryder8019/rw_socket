const express = require('express');
const { ObjectId } = require('mongodb');
const Club = require('../../../plugins/mongo/models/Club');
const { generateFormFields } = require('../../../plugins/helpers/formHelper');
const { upload, processImages } = require('../../../plugins/multer/subscriptionSetup'); // Adjust the import as necessary
const { uploadToLinode } = require('../../../plugins/aws_sdk/setup');

const router = express.Router();

// Define file fields for multer based on model configuration
const fileFields = [
  { name: 'mediumIcon', maxCount: 1 },
  { name: 'squareNonAuthBkgd', maxCount: 1 },
  { name: 'squareAuthBkgd', maxCount: 1 },
  { name: 'horizNonAuthBkgd', maxCount: 1 },
  { name: 'horizAuthBkgd', maxCount: 1 }
];

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

// Middleware to upload images to Linode
const uploadImagesToLinode = async (req, res, next) => {
  try {
    if (req.files) {
      for (const key in req.files) {
        const file = req.files[key][0];
        const fileKey = `clubs/${Date.now()}-${file.originalname}`;
        const url = await uploadToLinode(file.path, fileKey);
        req.body[key] = url; // Save the URL in the request body
      }
    }
    next();
  } catch (error) {
    console.error("Error in uploadImagesToLinode middleware:", error);
    next(error);
  }
};

// Route to create a club
router.post('/create', upload.fields(fileFields), processImages, uploadImagesToLinode, async (req, res) => {
  try {
    const clubData = req.body;
    const club = new Club(clubData);
    const result = await club.create(clubData);
    res.status(201).send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

// Route to get all clubs
router.get('/all', async (req, res) => {
  try {
    const clubs = await new Club().getAll();
    res.render('admin/clubs/template', {
      title: 'All Clubs',
      clubs: clubs
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

// Route to get a club by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).send({ error: 'Invalid ID format' });
    }
    const club = await new Club().getById(id);
    res.status(200).send(club);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

// Route to update a club by ID
router.put('/:id', upload.fields(fileFields), processImages, uploadImagesToLinode, async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).send({ error: 'Invalid ID format' });
    }
    const updatedClub = req.body;
    const result = await new Club().updateById(id, updatedClub);
    res.status(200).send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

// Route to delete a club by ID
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).send({ error: 'Invalid ID format' });
    }
    const result = await new Club().deleteById(id);
    res.status(200).send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

router.get('/section', async (req,res) => {
  try{  
   res.send('hi')
  //   const clubs = await new Club().getAll();
  // res.render('admin/clubs/clubs',{
  //  title:'all clubs',
  //   clubs:clubs
  //});
  } catch(error){
    console.error(error);
   // res.status(500).send({ error: error.message });
  }
});
module.exports = router;
