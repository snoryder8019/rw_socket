const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const SectionSettings = require('../../../plugins/mongo/models/SectionSettings');
const { uploadToLinode } = require('../../../plugins/aws_sdk/setup'); // Ensure this path is correct

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Route to load section settings form
router.get('/loadSectionsForm', async (req, res) => {
  try {
    const settings = await SectionSettings.getAll();
    const setting = settings.length > 0 ? settings[0] : {};

    res.send(`
      <h1>Section Settings</h1>
      <div id="settingsList">
        <!-- Display existing settings here -->
      </div>

      <h2>Create or Update Section Settings</h2>
      <form class="adminForms" action="/sectionSettings/addOrUpdateSettings" method="POST" enctype="multipart/form-data">
        <label for="visible">Visible:</label>
        <input type="checkbox" name="visible" id="visible" ${setting.visible ? 'checked' : ''}>

        <label for="auth_view">Auth View:</label>
        <input type="checkbox" name="auth_view" id="auth_view" ${setting.auth_view ? 'checked' : ''}>

        <label for="backgroundImg">Background Image:</label>
        <input type="file" name="backgroundImg" id="backgroundImg">

        <label for="secondaryBackgroundImg">Secondary Background Image:</label>
        <input type="file" name="secondaryBackgroundImg" id="secondaryBackgroundImg">

        <label for="title">Title:</label>
        <input type="text" name="title" id="title" value="${setting.title || ''}">

        <label for="subtitle">Subtitle:</label>
        <input type="text" name="subtitle" id="subtitle" value="${setting.subtitle || ''}">

        <label for="description">Description:</label>
        <textarea name="description" id="description">${setting.description || ''}</textarea>

        <label for="entryButtonText">Entry Button Text:</label>
        <input type="text" name="entryButtonText" id="entryButtonText" value="${setting.entryButton ? setting.entryButton.text : ''}">

        <label for="entryButtonUrl">Entry Button URL:</label>
        <input type="text" name="entryButtonUrl" id="entryButtonUrl" value="${setting.entryButton ? setting.entryButton.url : ''}">

        <button type="submit">Save Settings</button>
      </form>
    `);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'An error occurred while fetching section settings data' });
  }
});

// Route to add or update settings with bucket upload
router.post('/addOrUpdateSettings', upload.fields([
  { name: 'backgroundImg' },
  { name: 'secondaryBackgroundImg' }
]), async (req, res) => {
  try {
    const { visible, auth_view, title, subtitle, description, entryButtonText, entryButtonUrl } = req.body;

    const settingsData = {
      visible: visible === 'on',
      auth_view: auth_view === 'on',
      title,
      subtitle,
      description,
      entryButton: {
        text: entryButtonText,
        url: entryButtonUrl
      }
    };

    const files = req.files;
    const uploadPromises = [];
    const fileFields = ['backgroundImg', 'secondaryBackgroundImg'];

    fileFields.forEach(field => {
      if (files[field]) {
        const file = files[field][0];
        const fileKey = `sectionSettings/${field}/${file.filename}`;
        uploadPromises.push(
          uploadToLinode(file.path, fileKey).then(url => {
            settingsData[field] = url;
          })
        );
      }
    });

    await Promise.all(uploadPromises);

    await SectionSettings.create(settingsData);
    req.flash('success', 'New settings created!');
    res.redirect('/');
  } catch (error) {
    console.error(error);
    req.flash('error', 'An error occurred while adding/updating the settings');
    res.status(500).send({ error: 'An error occurred while adding/updating the settings' });
  }
});
router.get('/load/edit/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const setting = await SectionSettings.getById(id);

    if (!setting) {
      return res.status(404).send({ error: 'Section settings not found' });
    }

    const htmlFilePath = path.join(__dirname, '../../html', 'editSectionSettings.html');
    res.sendFile(htmlFilePath);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'An error occurred while loading section settings for editing' });
  }
});
module.exports = router;
