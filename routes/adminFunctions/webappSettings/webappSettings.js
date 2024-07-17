const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const WebAppSettings = require('../../../plugins/mongo/models/WebAppSettings');
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

// Route to load webapp settings
router.get('/loadAddModelForm', async (req,res)=>{
  try{

res.send(`<h1>Create Model</h1>
    <form action="/webappSettings/createModel" method="post">
        <label for="modelName">Model Name:</label>
        <input type="text" id="modelName" name="modelName" required><br><br>

        <label for="attribute1">Attribute 1:</label>
        <input type="text" id="attribute1" name="attribute1" required><br><br>

        <label for="attribute2">Attribute 2:</label>
        <input type="text" id="attribute2" name="attribute2" required><br><br>

        <label for="attribute3">Attribute 3:</label>
        <input type="text" id="attribute3" name="attribute3" required><br><br>

        <input type="submit" value="Create Model">
    </form>`);


  }
  catch(error){console.error(error)}
  
  res.render('error',{error:error})
})


router.get('/loadSettingsForm', async (req, res) => {
  try {
    const settings = await WebAppSettings.getAll();
    const setting = settings.length > 0 ? settings[0] : {};

    // const settingsHtml = `
    //   <div class="settings">
    //     <p>Main Banner Desktop: ${setting.mainBannerDesktop || ''}</p>
    //     <form action="/webappSettings/editSettings" method="POST">
    //       <input type="hidden" name="id" value="${setting._id || ''}">
    //       <button type="submit">Edit Settings</button>
    //     </form>
    //   </div>
    // `;

    res.send(`
      <h1>WebApp Settings</h1>
      <div id="settingsList">
   
      </div>

      <h2>Create or Update Settings</h2>
      <form class="adminForms" action="/webappSettings/addOrUpdateSettings" method="POST" enctype="multipart/form-data">
        <label for="mainBannerDesktop">Main Banner Desktop (1800x250):</label>
        <input type="file" name="mainBannerDesktop" id="mainBannerDesktop" value="${setting.mainBannerDesktop || ''}">

        <label for="mainBannerCell">Main Banner Cell (1250x400):</label>
        <input type="file" name="mainBannerCell" id="mainBannerCell" value="${setting.mainBannerCell || ''}">

        <label for="mainLogo">Main Logo (500x500):</label>
        <input type="file" name="mainLogo" id="mainLogo" value="${setting.mainLogo || ''}">

        <label for="thumbnailLogo">Thumbnail Logo:</label>
        <input type="file" name="thumbnailLogo" id="thumbnailLogo" value="${setting.thumbnailLogo || ''}">

        <label for="signInIcon">Sign In Icon:</label>
        <input type="file" name="signInIcon" id="signInIcon" value="${setting.signInIcon || ''}">

        <label for="dashboardIcon">Dashboard Icon:</label>
        <input type="file" name="dashboardIcon" id="dashboardIcon" value="${setting.dashboardIcon || ''}">

        <label for="chatIcon">Chat Icon:</label>
        <input type="file" name="chatIcon" id="chatIcon" value="${setting.chatIcon || ''}">

        <label for="borderRadiusBanner">Border Radius Banner (px):</label>
        <input type="range" min="0" max="100" name="borderRadiusBanner" id="borderRadiusBanner" value="${setting.borderRadiusBanner || ''}">

        <label for="borderRadiusMainContentBox">Border Radius Main Content Box (px):</label>
        <input type="range" min="0" max="100" name="borderRadiusMainContentBox" id="borderRadiusMainContentBox" value="${setting.borderRadiusMainContentBox || ''}">

        <label for="borderWidthStyleColor">Border Width Style Color Settings:</label>
        <input type="color" name="borderWidthStyleColor" id="borderWidthStyleColor" value="${setting.borderWidthStyleColor || ''}">

        <label for="boxShadowInsetWidthStyleColor">Box Shadow Inset Width Style Color Settings:</label>
        <input type="text" name="boxShadowInsetWidthStyleColor" id="boxShadowInsetWidthStyleColor" value="${setting.boxShadowInsetWidthStyleColor || ''}">

        <label for="mainFont">Main Font:</label>
        <input type="text" name="mainFont" id="mainFont" value="${setting.mainFont || ''}">

        <label for="mainFontColor">Main Font Color:</label>
        <input type="color" name="mainFontColor" id="mainFontColor" value="${setting.mainFontColor || ''}">

        <label for="secondaryFont">Secondary Font:</label>
        <input type="text" name="secondaryFont" id="secondaryFont" value="${setting.secondaryFont || ''}">

        <label for="secondaryFontColor">Secondary Font Color:</label>
        <input type="color" name="secondaryFontColor" id="secondaryFontColor" value="${setting.secondaryFontColor || ''}">

        <label for="backgroundMainColor">Background Main Color:</label>
        <input type="color" name="backgroundMainColor" id="backgroundMainColor" value="${setting.backgroundMainColor || ''}">

        <label for="chatGradient">Chat Gradient:</label>
        <input type="text" name="chatGradient" id="chatGradient" value="${setting.chatGradient || ''}">

        <label for="googleLoginIcon">Google Login Icon:</label>
        <input type="file" name="googleLoginIcon" id="googleLoginIcon" value="${setting.googleLoginIcon || ''}">

        <label for="facebookLoginIcon">Facebook Login Icon:</label>
        <input type="file" name="facebookLoginIcon" id="facebookLoginIcon" value="${setting.facebookLoginIcon || ''}">

        <label for="passwordLoginIcon">Password Login Icon:</label>
        <input type="file" name="passwordLoginIcon" id="passwordLoginIcon" value="${setting.passwordLoginIcon || ''}">

        <label for="registerIcon">Register Icon:</label>
        <input type="file" name="registerIcon" id="registerIcon" value="${setting.registerIcon || ''}">

        <label for="linkColor">Link Color:</label>
        <input type="color" name="linkColor" id="linkColor" value="${setting.linkColor || ''}">

        <label for="inputBackground">Input Background:</label>
        <input type="text" name="inputBackground" id="inputBackground" value="${setting.inputBackground || ''}">

        <label for="inputBoxShadow">Input Box Shadow:</label>
        <input type="text" name="inputBoxShadow" id="inputBoxShadow" value="${setting.inputBoxShadow || ''}">

        <label for="inputFontFamily">Input Font Family:</label>
        <input type="text" name="inputFontFamily" id="inputFontFamily" value="${setting.inputFontFamily || ''}">

        <label for="inputFontWeight">Input Font Weight:</label>
        <input type="range" min="0" max="100" name="inputFontWeight" id="inputFontWeight" value="${setting.inputFontWeight || ''}">

        <label for="inputFontColor">Input Font Color:</label>
        <input type="color" name="inputFontColor" id="inputFontColor" value="${setting.inputFontColor || ''}">

        <button type="submit">Save Settings</button>
      </form>
    `);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'An error occurred while fetching webapp settings data' });
  }
});

// Route to add or update settings with bucket upload
router.post('/addOrUpdateSettings', upload.fields([
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

    const settingsData = {
      borderRadiusBanner, borderRadiusMainContentBox, borderWidthStyleColor,
      boxShadowInsetWidthStyleColor, mainFont, mainFontColor, secondaryFont,
      secondaryFontColor, backgroundMainColor, chatGradient, linkColor, inputBackground,
      inputBoxShadow, inputFontFamily, inputFontWeight, inputFontColor
    };

    const files = req.files;
    const uploadPromises = [];
    const fileFields = [
      'mainBannerDesktop', 'mainBannerCell', 'mainLogo', 'thumbnailLogo',
      'signInIcon', 'dashboardIcon', 'chatIcon', 'googleLoginIcon',
      'facebookLoginIcon', 'passwordLoginIcon', 'registerIcon'
    ];

    fileFields.forEach(field => {
      if (files[field]) {
        const file = files[field][0];
        const fileKey = `webappSettings/${field}/${file.filename}`;
        uploadPromises.push(
          uploadToLinode(file.path, fileKey).then(url => {
            settingsData[field] = url;
          })
        );
      }
    });

    await Promise.all(uploadPromises);

    const existingSettings = await WebAppSettings.getAll();
    if (existingSettings.length > 0) {
      await WebAppSettings.updateById(existingSettings[0]._id, settingsData);
      req.flash('success', 'Settings updated successfully!');
   res.redirect('/')
  } else {
    await WebAppSettings.create(new WebAppSettings(settingsData));
    req.flash('success', 'New settings created!');
    res.redirect('/')
    }
    res.redirect('/webappSettings/load');
  } catch (error) {
    console.error(error);
    req.flash('error', 'An error occurred while adding/updating the settings');
    res.render('error',{error:error});
  }
});

// Route to edit settings and render the generalEditor view

module.exports = router;
