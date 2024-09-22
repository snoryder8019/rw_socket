import express from 'express';
import UserSetting from '../../../plugins/mongo/models/user/UserSetting.js';
import generateFormFields from '../../../plugins/helpers/formHelper.js';
import { buildRoutes } from '../../helpers/routeBuilder.js';
import { uploadMultiple } from '../../../plugins/multer/setup.js';
import { imagesArray, getImagesArray, popImagesArray, popImagesArrayIndex } from '../../helpers/imagesArray.js';

const router = express.Router();
const modelName = 'userSetting';

router.get('/renderAddForm', (req, res) => {
  try {
    const model = UserSetting.getModelFields();
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
    const userSetting = await new UserSetting().getById(id);
    if (!userSetting) {
      return res.status(404).send({ error: 'User setting not found' });
    }

    const model = UserSetting.getModelFields();
    const formFields = generateFormFields(model, userSetting);

    res.render('forms/generalEditForm', {
      title: `Edit ${modelName}`,
      action: `${modelName}s/update/${id}`,
      formFields: formFields,
      data: userSetting,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

router.post('/:id/upload-images', uploadMultiple, imagesArray(UserSetting));
router.get('/renderImagesArray/:id', getImagesArray(UserSetting));
router.get('/popImagesArray/:id/:url', popImagesArray(UserSetting));
router.get('/popImagesArrayIndex/:id/:index', popImagesArrayIndex(UserSetting));

buildRoutes(new UserSetting(), router);

export default router;
