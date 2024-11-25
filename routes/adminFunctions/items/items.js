import express from 'express';
import Item from '../../../plugins/mongo/models/exchange/Item.js';
import generateFormFields from '../../../plugins/helpers/formHelper.js';
import { buildRoutes } from '../../helpers/routeBuilder.js';
import { uploadMultiple } from '../../../plugins/multer/setup.js';
import { imagesArray, getImagesArray, popImagesArray, popImagesArrayIndex } from '../../helpers/imagesArray.js';

const router = express.Router();
const modelName = 'item';

router.get('/renderAddForm', (req, res) => {
  try {
    const model = Item.getModelFields();
    const formFields = generateFormFields(model);

    res.render('forms/generalForm', {
      title: `Add New ${modelName}`,
      action: `/${modelName}s/create`,
      formFields: formFields,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

router.get('/renderEditForm/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const item = await new Item().getById(id);
    if (!item) {
      return res.status(404).send({ error: 'Item not found' });
    }

    const model = Item.getModelFields();
    const formFields = generateFormFields(model, item);

    res.render('forms/generalEditForm', {
      title: `Edit ${modelName}`,
      action: `${modelName}s/update/${id}`,
      formFields: formFields,
      data: item,
      routeSub:'items',
      method:'post',
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

router.post('/:id/upload-images', uploadMultiple, imagesArray(Item));
router.get('/renderImagesArray/:id', getImagesArray(Item));
router.get('/popImagesArray/:id/:url', popImagesArray(Item));
router.get('/popImagesArrayIndex/:id/:index', popImagesArrayIndex(Item));

buildRoutes(new Item(), router);

export default router;
