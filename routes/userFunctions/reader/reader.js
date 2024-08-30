import express from "express";
import Blog from "../../../plugins/mongo/models/blog/Blog.js";
import Destination from "../../../plugins/mongo/models/travel/Destination.js";
import Help from "../../../plugins/mongo/models/help/Help.js";
import Vote from "../../../plugins/mongo/models/blog/Vote.js";

const router = express.Router();
const readerOptions = {
  blog: Blog,
  destination: Destination,
  help: Help,
  vote: Vote,
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

export default router;
