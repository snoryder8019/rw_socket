const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const WebAppSettings = require('../../../plugins/mongo/models/WebAppSettings');
const { ObjectId } = require('mongodb');

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

// Route to get all webapp settings
router.get('/load', async (req, res) => {
  try {
    const settings = await WebAppSettings.getAll();
    const settingsHtml = settings.map(setting => `
      <div class="settings">
        <p>Main Banner Desktop: ${setting.mainBannerDesktop}</p>
        <form action="/webappSettings/editSettings" method="POST">
          <input type="hidden" name="id" value="${setting._id}">
          <button type="submit">Edit Settings</button>
        </form>
        <form action="/webappSettings/deleteSettings" method="POST">
          <input type="hidden" name="id" value="${setting._id}">
          <button type="submit">Delete Settings</button>
        </form>
      </div>
    `).join('');

    res.send(`
      <h1>WebApp Settings</h1>
      <div id="settingsList">
        ${settingsHtml}
      </div>

      <h2>Create New Settings</h2>
      <form class="adminForms" action="/webappSettings/addSettings" method="POST" enctype="multipart/form-data">
        <label for="mainBannerDesktop">Main Banner Desktop (1800x250):</label>
        <input type="file" name="mainBannerDesktop" id="mainBannerDesktop">

        <label for="mainBannerCell">Main Banner Cell (1250x400):</label>
        <input type="file" name="mainBannerCell" id="mainBannerCell">

        <label for="mainLogo">Main Logo (500x500):</label>
        <input type="file" name="mainLogo" id="mainLogo">

        <label for="thumbnailLogo">Thumbnail Logo:</label>
        <input type="file" name="thumbnailLogo" id="thumbnailLogo">

        <label for="signInIcon">Sign In Icon:</label>
        <input type="file" name="signInIcon" id="signInIcon">

        <label for="dashboardIcon">Dashboard Icon:</label>
        <input type="file" name="dashboardIcon" id="dashboardIcon">

        <label for="chatIcon">Chat Icon:</label>
        <input type="file" name="chatIcon" id="chatIcon">

        <label for="borderRadiusBanner">Border Radius Banner (px):</label>
        <input type="text" name="borderRadiusBanner" id="borderRadiusBanner">

        <label for="borderRadiusMainContentBox">Border Radius Main Content Box (px):</label>
        <input type="text" name="borderRadiusMainContentBox" id="borderRadiusMainContentBox">

        <label for="borderWidthStyleColor">Border Width Style Color Settings:</label>
        <input type="text" name="borderWidthStyleColor" id="borderWidthStyleColor">

        <label for="boxShadowInsetWidthStyleColor">Box Shadow Inset Width Style Color Settings:</label>
        <input type="text" name="boxShadowInsetWidthStyleColor" id="boxShadowInsetWidthStyleColor">

        <label for="mainFont">Main Font:</label>
        <input type="text" name="mainFont" id="mainFont">

        <label for="mainFontColor">Main Font Color:</label>
        <input type="text" name="mainFontColor" id="mainFontColor">

        <label for="secondaryFont">Secondary Font:</label>
        <input type="text" name="secondaryFont" id="secondaryFont">

        <label for="secondaryFontColor">Secondary Font Color:</label>
        <input type="text" name="secondaryFontColor" id="secondaryFontColor">

        <label for="backgroundMainColor">Background Main Color:</label>
        <input type="text" name="backgroundMainColor" id="backgroundMainColor">

        <label for="chatGradient">Chat Gradient:</label>
        <input type="text" name="chatGradient" id="chatGradient">

        <label for="googleLoginIcon">Google Login Icon:</label>
        <input type="file" name="googleLoginIcon" id="googleLoginIcon">

        <label for="facebookLoginIcon">Facebook Login Icon:</label>
        <input type="file" name="facebookLoginIcon" id="facebookLoginIcon">

        <label for="passwordLoginIcon">Password Login Icon:</label>
        <input type="file" name="passwordLoginIcon" id="passwordLoginIcon">

        <label for="registerIcon">Register Icon:</label>
        <input type="file" name="registerIcon" id="registerIcon">

        <label for="linkColor">Link Color:</label>
        <input type="text" name="linkColor" id="linkColor">

        <label for="inputBackground">Input Background:</label>
        <input type="text" name="inputBackground" id="inputBackground">

        <label for="inputBoxShadow">Input Box Shadow:</label>
        <input type="text" name="inputBoxShadow" id="inputBoxShadow">

        <label for="inputFontFamily">Input Font Family:</label>
        <input type="text" name="inputFontFamily" id="inputFontFamily">

        <label for="inputFontWeight">Input Font Weight:</label>
        <input type="text" name="inputFontWeight" id="inputFontWeight">

        <label for="inputFontColor">Input Font Color:</label>
        <input type="text" name="inputFontColor" id="inputFontColor">

        <button type="submit">Add Settings</button>
      </form>
    `);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'An error occurred while fetching webapp settings data' });
  }
});

// Route to add new settings
router.post('/addSettings', upload.fields([
  { name: 'mainBannerDesktop' },
  { name: 'mainBannerCell' },
  { name: 'mainLogo' },
  { name: 'thumbnailLogo' },
  { name: 'signInIcon' },
  { name: 'dashboardIcon' },
  { name: 'chatIcon' },
  { name: 'googleLoginIcon' },
  { name: 'facebookLoginIcon' },
  { name: 'passwordLoginIcon' },
  { name: 'registerIcon' }
]), async (req, res) => {
  try {
    const {
      borderRadiusBanner, borderRadiusMainContentBox, borderWidthStyleColor,
      boxShadowInsetWidthStyleColor, mainFont, mainFontColor, secondaryFont,
      secondaryFontColor, backgroundMainColor, chatGradient, linkColor, inputBackground,
      inputBoxShadow, inputFontFamily, inputFontWeight, inputFontColor
    } = req.body;

    const newSettings = new WebAppSettings({
      mainBannerDesktop: req.files['mainBannerDesktop'] ? req.files['mainBannerDesktop'][0].path : '',
      mainBannerCell: req.files['mainBannerCell'] ? req.files['mainBannerCell'][0].path : '',
      mainLogo: req.files['mainLogo'] ? req.files['mainLogo'][0].path : '',
      thumbnailLogo: req.files['thumbnailLogo'] ? req.files['thumbnailLogo'][0].path : '',
      signInIcon: req.files['signInIcon'] ? req.files['signInIcon'][0].path : '',
      dashboardIcon: req.files['dashboardIcon'] ? req.files['dashboardIcon'][0].path : '',
      chatIcon: req.files['chatIcon'] ? req.files['chatIcon'][0].path : '',
      googleLoginIcon: req.files['googleLoginIcon'] ? req.files['googleLoginIcon'][0].path : '',
      facebookLoginIcon: req.files['facebookLoginIcon'] ? req.files['facebookLoginIcon'][0].path : '',
      passwordLoginIcon: req.files['passwordLoginIcon'] ? req.files['passwordLoginIcon'][0].path : '',
      registerIcon: req.files['registerIcon'] ? req.files['registerIcon'][0].path : '',
      borderRadiusBanner, borderRadiusMainContentBox, borderWidthStyleColor,
      boxShadowInsetWidthStyleColor, mainFont, mainFontColor, secondaryFont,
      secondaryFontColor, backgroundMainColor, chatGradient, linkColor, inputBackground,
      inputBoxShadow, inputFontFamily, inputFontWeight, inputFontColor
    });

    await WebAppSettings.create(newSettings);
    req.flash('success_msg', 'New settings created!');
    res.redirect('/webappSettings/load');
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'An error occurred while adding the settings');
    res.status(500).send({ error: 'An error occurred while adding the settings' });
  }
});

// Route to delete settings
router.post('/deleteSettings', async (req, res) => {
  try {
    const { id } = req.body;
    await WebAppSettings.deleteById(id);
    req.flash('success_msg', 'Settings deleted!');
    res.redirect('/webappSettings/load');
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'An error occurred while deleting the settings');
    res.status(500).send({ error: 'An error occurred while deleting the settings' });
  }
});

// Route to edit settings and render the generalEditor view
router.post('/editSettings', async (req, res) => {
  try {
    const { id } = req.body;
    const setting = await WebAppSettings.getById(id);
    if (!setting) {
      return res.status(404).send({ error: 'Settings not found' });
    }
    res.render('generalEditor', { model: 'WebAppSettings', data: setting });
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'An error occurred while fetching the settings data');
    res.status(500).send({ error: 'An error occurred while fetching the settings data' });
  }
});

// Route to update settings
router.post('/updateSettings', upload.fields([
  { name: 'mainBannerDesktop' },
  { name: 'mainBannerCell' },
  { name: 'mainLogo' },
  { name: 'thumbnailLogo' },
  { name: 'signInIcon' },
  { name: 'dashboardIcon' },
  { name: 'chatIcon' },
  { name: 'googleLoginIcon' },
  { name: 'facebookLoginIcon' },
  { name: 'passwordLoginIcon' },
  { name: 'registerIcon' }
]), async (req, res) => {
  try {
    const {
      id, borderRadiusBanner, borderRadiusMainContentBox, borderWidthStyleColor,
      boxShadowInsetWidthStyleColor, mainFont, mainFontColor, secondaryFont,
      secondaryFontColor, backgroundMainColor, chatGradient, linkColor, inputBackground,
      inputBoxShadow, inputFontFamily, inputFontWeight, inputFontColor
    } = req.body;

    const updatedSettings = {
      mainBannerDesktop: req.files['mainBannerDesktop'] ? req.files['mainBannerDesktop'][0].path : req.body.mainBannerDesktop,
      mainBannerCell: req.files['mainBannerCell'] ? req.files['mainBannerCell'][0].path : req.body.mainBannerCell,
      mainLogo: req.files['mainLogo'] ? req.files['mainLogo'][0].path : req.body.mainLogo,
      thumbnailLogo: req.files['thumbnailLogo'] ? req.files['thumbnailLogo'][0].path : req.body.thumbnailLogo,
      signInIcon: req.files['signInIcon'] ? req.files['signInIcon'][0].path : req.body.signInIcon,
      dashboardIcon: req.files['dashboardIcon'] ? req.files['dashboardIcon'][0].path : req.body.dashboardIcon,
      chatIcon: req.files['chatIcon'] ? req.files['chatIcon'][0].path : req.body.chatIcon,
      googleLoginIcon: req.files['googleLoginIcon'] ? req.files['googleLoginIcon'][0].path : req.body.googleLoginIcon,
      facebookLoginIcon: req.files['facebookLoginIcon'] ? req.files['facebookLoginIcon'][0].path : req.body.facebookLoginIcon,
      passwordLoginIcon: req.files['passwordLoginIcon'] ? req.files['passwordLoginIcon'][0].path : req.body.passwordLoginIcon,
      registerIcon: req.files['registerIcon'] ? req.files['registerIcon'][0].path : req.body.registerIcon,
      borderRadiusBanner, borderRadiusMainContentBox, borderWidthStyleColor,
      boxShadowInsetWidthStyleColor, mainFont, mainFontColor, secondaryFont,
      secondaryFontColor, backgroundMainColor, chatGradient, linkColor, inputBackground,
      inputBoxShadow, inputFontFamily, inputFontWeight, inputFontColor
    };

    await WebAppSettings.updateById(id, updatedSettings);
    req.flash('success_msg', 'Settings updated successfully');
    res.redirect('/webappSettings/load');
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'An error occurred while updating the settings');
    res.status(500).send({ error: 'An error occurred while updating the settings' });
  }
});

module.exports = router;
