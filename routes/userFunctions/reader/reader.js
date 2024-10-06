import express from "express";
import Blog from "../../../plugins/mongo/models/blog/Blog.js";
import Destination from "../../../plugins/mongo/models/travel/Destination.js";
import Help from "../../../plugins/mongo/models/help/Help.js";
import Vote from "../../../plugins/mongo/models/blog/Vote.js";
import Club from "../../../plugins/mongo/models/Club.js";
import Video from '../../../plugins/mongo/models/Video.js'
import Vendor from '../../../plugins/mongo/models/Vendor.js'
import {marked} from 'marked';
import Excursion from '../../../plugins/mongo/models/travel/Excursion.js'
import Notification from '../../../plugins/mongo/models/notifications/Notification.js'
import Notify from "../../../plugins/mongo/models/notifications/Notify.js";
import chalk from 'chalk';
const router = express.Router();
const readerOptions = {
  blog: Blog,
  destination: Destination,
  help: Help,
  vote: Vote,
  excursion:Excursion,
  vendor:Vendor,
  club : Club,
};

// Route handler to dynamically render data based on the model parameter
router.get('/grid/:model', async (req, res) => {
  try {
    const modelParam = req.params.model.toLowerCase(); // Normalize to lowercase
    const ModelClass = readerOptions[modelParam]; // Lookup the model class

    if (!ModelClass) {
      // If model is not found in readerOptions, return a 404 error
      return res.status(404).send({ error: 'Model not found' });
    }

    const models = await new ModelClass().getAll(); // Fetch all data for the model

    console.log(`Model: ${modelParam}, Data: ${Object.values(models[0])[1]}`);

    // Render the partial with the data
    res.render('partials/reader', { models, modelName: modelParam ,modelClass:modelParam});

  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send({ error: 'Internal Server Error' });
  }
});
router.get('/videos',async(req,res)=>{
try{
  const videos = await new Video().getAll();
  console.log(videos)
  res.render('partials/videoReels',{videos:videos})
}
catch(error){console.error(error)}
})
router.get('/overlay/:model/:id', async (req, res) => {
  try {
    const { model, id } = req.params;
    const modelParam = model.toLowerCase();

    // Dynamic model mapping
    const modelMap = {
      destination: Destination,
      club: Club,
      blog: Blog,
      excursion: Excursion,
      vendor: Vendor,
      video: Video // Assuming these classes are available
    };

    const Model = modelMap[modelParam];
    if (!Model) {
      return res.status(400).json({ message: 'Invalid model type' });
    }

    // Fetch the record
    const record = await new Model().getById(id);
    if (!record) {
      return res.status(404).send('<p>Data not found</p>');
    }

    // Convert content using markdown if necessary
    const htmlLayout = marked(record.content);

    // Initialize additionalData and populate it if necessary
    let additionalData = {};

    if (modelParam === 'club' || modelParam === 'destination') {
      // Check if record.excursions and record.vendors are arrays of IDs
      const excursionIds = Array.isArray(record.excursions)
        ? record.excursions.filter(id => typeof id === 'string' && id.trim() !== '')
        : [];

      const vendorIds = Array.isArray(record.vendors)
        ? record.vendors.filter(id => typeof id === 'string' && id.trim() !== '')
        : [];

      // Log the IDs for debugging
      console.log('Excursion IDs:', excursionIds);
      console.log('Vendor IDs:', vendorIds);

      // Fetch actual excursions and vendors by their IDs
      const excursions = excursionIds.length > 0
        ? await Promise.all(excursionIds.map(id => new Excursion().getById(id)))
        : [];

      const vendors = vendorIds.length > 0
        ? await Promise.all(vendorIds.map(id => new Vendor().getById(id)))
        : [];

      // Log fetched data for debugging
      console.log('Fetched Excursions:', excursions);
      console.log('Fetched Vendors:', vendors);

      additionalData = {
        excursions,
        vendors,
      };
    }

    console.log('Additional Data:', additionalData); // Log the entire additionalData object

    // Render the popup with the fetched data
    res.render('partials/readerPopup', { record, htmlLayout, additionalData });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send('<p>Internal server error</p>');
  }
});




export default router;
