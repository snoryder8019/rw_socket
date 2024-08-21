//routes/helpers/routeBuilder.js **GPT NOTE: DONT REMOVE THIS LINE IN EXAMPLES**

const { ObjectId } = require('mongodb');

// model needs to be an instance of the model that you want routes built for.
// router needs to be an instance of an express router provided from the route file that you are utilizing
const buildRoutes = (model, router) => {
  router.post('/create', [...model.middlewareForCreateRoute()], async (req, res) => {
    try {
      const documentData = req.body;
      const document = new model.constructor(documentData);
      const result = await document.create(documentData);
      req.flash("message",`Success!, Created document: ${result}`)
      res.redirect('/')
    } catch (error) {
      console.error(error);
      res.status(500).send({ error: error.message });
    }
  });

  router.get('/all', async (req, res) => {
    try {
      const documents = await model.getAll();
      // NOTE: Right now the below model method will return a string with the location of your view. If you always have the same file name and location relative to your router files we can set this instead using path.join(__dirname, ...). This would prevent us from having to define the path in the model file.
      res.render(model.pathForGetRouteView(), { documents: documents});
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
      const document = await model.getById(id);
      res.status(200).send(document);
    } catch (error) {
      console.error(error);
      res.status(500).send({ error: error.message });
    }
  });

  router.post('/update/:id', [...model.middlewareForEditRoute()], async (req, res) => {
    try {
      const { id } = req.params;
      if (!ObjectId.isValid(id)) {
        return res.status(400).send({ error: 'Invalid ID format' });
      }
      const updatedDocument = req.body;
      const result = await model.updateById(id, updatedDocument);
      req.flash("message",`Success!, Updated document: ${result}`)
      res.redirect('/')
    } catch (error) {
      console.error(error);
      res.status(500).send({ error: error.message });
    }
  });

  router.post('/delete/:id', [...model.middlewareForDeleteRoute()], async (req, res) => {
    try {
      const { id } = req.params;
      if (!ObjectId.isValid(id)) {
        return res.status(400).send({ error: 'Invalid ID format' });
      }
      const result = await model.deleteById(id);
      req.flash("message",`Success!, Deleted document: ${result}`)
     res.redirect('/')
    } catch (error) {
      console.error(error);
      res.status(500).send({ error: error.message });
    }
  });
};

module.exports = buildRoutes;
