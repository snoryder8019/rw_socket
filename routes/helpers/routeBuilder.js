//routes/helpers/routeBuilder.js **GPT NOTE: DONT REMOVE THIS LINE IN EXAMPLES**

import { ObjectId } from 'mongodb';

// model needs to be an instance of the model that you want routes built for.
// router needs to be an instance of an express router provided from the route file that you are utilizing
export const buildRoutes = (model, router) => {
  router.post(
    '/create',
    [...model.middlewareForCreateRoute()],
    async (req, res) => {
      try {
        const documentData = req.body;
        const document = new model.constructor(documentData);
        const result = await document.create(documentData);
        req.flash('message', `Success!, Created document: ${result}`);
        res.redirect('/');
      } catch (error) {
        console.error(error);
        res.status(500).send({ error: error.message });
      }
    }
  );

  router.get('/all', async (req, res) => {
    try {
      const documents = await model.getAll();
      // NOTE: Right now the below model method will return a string with the location of your view. If you always have the same file name and location relative to your router files we can set this instead using path.join(__dirname, ...). This would prevent us from having to define the path in the model file.
      res.render(model.pathForGetRouteView(), { documents: documents });
    } catch (error) {
      console.error(error);
      res.status(500).send({ error: error.message });
    }
  });
  router.get('/allData', async (req, res) => {
    try {
      const documents = await model.getAll();
      // NOTE: Right now the below model method will return a string with the location of your view. If you always have the same file name and location relative to your router files we can set this instead using path.join(__dirname, ...). This would prevent us from having to define the path in the model file.
      res.send(documents);
    } catch (error) {
      console.error(error);
      res.status(500).send({ error: error.message });
    }
  });

  router.get('/:id', [...model.middlewareForGetRoute()], async (req, res) => {
    try {
      const { id } = req.params;
      if (!ObjectId.isValid(id)) {
        return res.status(400).send({ error: 'Invalid ID format' });
      }
      console.log(document);
      const document = await model.getById(id);
      res.status(200).send(document);
    } catch (error) {
      console.error(error);
      res.status(500).send({ error: error.message });
    }
  });
  router.get('/imagesArray/:id', [...model.middlewareForGetRoute()], async (req, res) => {
    try {
      const { id } = req.params;
      
      // Check if the provided ID is a valid MongoDB ObjectId
      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid ID format' });
      }
  
      // Fetch the document from the database using the model's getById method
      const document = await model.getById(id);
  
      // Check if the document was found
      if (!document) {
        return res.status(404).json({ error: 'Document not found' });
      }
  
      // Extract the images array from the document
      const imagesArray = document.imagesArray;
  
      // Send a structured response
      res.status(200).json({ imagesArray });
  
      console.log(`Array of Images: ${imagesArray}`);
    } catch (error) {
      console.error('Error fetching images array:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  router.post(
    '/update/:id',
    [...model.middlewareForEditRoute()],
    async (req, res) => {
      try {
        const { id } = req.params;
        if (!ObjectId.isValid(id)) {
          return res.status(400).send({ error: 'Invalid ID format' });
        }
        const updatedDocument = req.body;
        const result = await model.updateById(id, updatedDocument);
        req.flash('message', `Success!, Updated document: ${result}`);
        res.redirect('/');
      } catch (error) {
        console.error(error);
        res.status(500).send({ error: error.message });
      }
    }
  );

  router.post(
    '/delete/:id',
    [...model.middlewareForDeleteRoute()],
    async (req, res) => {
      try {
        const { id } = req.params;
        if (!ObjectId.isValid(id)) {
          return res.status(400).send({ error: 'Invalid ID format' });
        }
        const result = await model.deleteById(id);
        req.flash('message', `Success!, Deleted document: ${result}`);
        res.redirect('/');
      } catch (error) {
        console.error(error);
        res.status(500).send({ error: error.message });
      }
    }
  );
};
