import express from "express";
import Blog from "../../../plugins/mongo/models/blog/Blog.js";
import Destination from "../../../plugins/mongo/models/travel/Destination.js";
import Help from "../../../plugins/mongo/models/help/Help.js";
import Vote from "../../../plugins/mongo/models/blog/Vote.js";
import Club from "../../../plugins/mongo/models/Club.js";

const router = express.Router();
const readerOptions = {
  blog: Blog,
  destination: Destination,
  help: Help,
  vote: Vote,
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
    res.render('partials/reader', { models, modelName: modelParam });

  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send({ error: 'Internal Server Error' });
  }
});
router.get('/users/reader/readerOverlay/:model/:id', async (req, res) => {
  try {
    const { model, id } = req.params;

    // Check if the requested model exists
    const Model = models[model];
    if (!Model) {
      return res.status(400).json({ message: 'Invalid model type' });
    }

    // Dynamically fetch the data by ID from the specified model
    const record = await new Model().getById(id); // Adjust method based on your ORM/ODM

    if (record) {
      // Prepare the data you want to send back
      const responseData = {
        id: record._id, // Replace with actual fields from your model
        title: record.title, // Replace with actual fields from your model
        content: record.content // Replace with actual fields from your model
      };

      // Send the data as JSON
      res.json(responseData);
    } else {
      // Send a 404 response if data is not found
      res.status(404).json({ message: 'Data not found' });
    }
  } catch (error) {
    // Handle errors, such as invalid ID format or database errors
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});
export default router;
