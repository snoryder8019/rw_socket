const { ObjectId } = require('mongodb');

// model needs to be an instance of the model that you want routes built for.
// router needs to be an instance of an express router provided from the route file that you are utilizing
const buildRoutes = (model, router,) => {
  router.post('/create', [...model.middlewareForCreateRoute()], async (req, res) => {
    try {
      const documentData = req.body;
      const document = new model.constructor(documentData);
      const result = await document.create(documentData);
      res.status(201).send(result);
    } catch (error) {
      console.error(error);
      res.status(500).send({ error: error.message });
    }
  });

  router.get('/all', async (req, res) => {
    try {
      const documents = await model.getAll();
      // Geoff: TODO: this isn't quite going to work. I need a way to dynamically figure out what the view location is and what parameters to pass to it.
      res.render(/*the location of the view as string*/'', {/*parameters needed by the view*/});
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

  router.put('/:id', [...model.middlewareForEditRoute()], async (req, res) => {
    try {
      const { id } = req.params;
      if (!ObjectId.isValid(id)) {
        return res.status(400).send({ error: 'Invalid ID format' });
      }
      const updatedDocument = req.body;
      const result = await model.updateById(id, updatedDocument);
      res.status(200).send(result);
    } catch (error) {
      console.error(error);
      res.status(500).send({ error: error.message });
    }
  });

  router.delete('/:id', [...model.middlewareForDeleteRoute()], async (req, res) => {
    try {
      const { id } = req.params;
      if (!ObjectId.isValid(id)) {
        return res.status(400).send({ error: 'Invalid ID format' });
      }
      const result = await model.deleteById(id);
      res.status(200).send(result);
    } catch (error) {
      console.error(error);
      res.status(500).send({ error: error.message });
    }
  });
};

module.exports = buildRoutes;
