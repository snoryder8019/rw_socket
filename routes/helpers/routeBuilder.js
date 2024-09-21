//routes/helpers/routeBuilder.js **GPT NOTE: DONT REMOVE THIS LINE IN EXAMPLES**
import chalk from 'chalk';
import { ObjectId } from 'mongodb';
import User from '../../plugins/mongo/models/User.js'
const permissionsChecker = async (req, res, next) => {
  // Check if user exists
  if (!req.user) {
    console.log('Permission denied: No user found');
    return res.status(403).json({ message: 'Forbidden: No user found' });
  }

  const pathSplit = req.originalUrl.split('/');
  const permission = pathSplit[1]; // Grab the first part of the path after '/'
  const userPermissions = req.user.permissions;
  const user = req.user.firstName + ' ' + req.user.lastName;

  // Check if the permission exists and is granted
  if (
    userPermissions.full ||
    (userPermissions && userPermissions[permission] === true)
  ) {
    console.log(
      `${user}: Permission granted for ${permission}, full access:${userPermissions.full}`
    );
    next(); // Permission granted, proceed to the next middleware
  } else {
    console.log(`Permission denied: ${permission}`);
    return res
      .status(403)
      .json({ message: 'Forbidden: Insufficient permissions' });
  }
};

// model needs to be an instance of the model that you want routes built for.
// router needs to be an instance of an express router provided from the route file that you are utilizing
export const buildRoutes = (model, router) => {
  router.post(
    '/create',
   
    [...model.middlewareForCreateRoute()],
    async (req, res) => {
      try {
        const documentData = req.body;
        const modelDocument = new model.constructor(documentData);
        const result = await modelDocument.create(documentData);
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
      let user = await new User().getById(req.user._id);
      user = {usid:user.shortId,_id:user._id}
      res.render(model.pathForGetRouteView(), { documents: documents, user:user });
    } catch (error) {
      console.error(error);
      res.status(500).send({ error: error.message });
    }
  });

  router.get('/allData', async (req, res) => {
    try {
      const documents = await model.getAll();
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

      const modelDocument = await model.getById(id);
      res.status(200).send(modelDocument);
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
  
      const modelDocument = await model.getById(id);
  
      // Check if the document was found
      if (!modelDocument) {
        return res.status(404).json({ error: 'Document not found' });
      }
  
      // Extract the images array from the document
      const imagesArray = modelDocument.imagesArray;
  
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
  
        // Convert boolean-like strings to actual booleans
        Object.keys(updatedDocument).forEach((key) => {
          if (updatedDocument[key] === 'true') updatedDocument[key] = true;
          if (updatedDocument[key] === 'false') updatedDocument[key] = false;
        });
  
        console.log(chalk.green.bold(
          `********ROUTES/HELPERS/ROUTEBUILDER.js*********   
          \n\n gameSettingsData:${JSON.stringify(updatedDocument)}
          \n*********END CONSOLE*********`));
  
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
