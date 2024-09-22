import ModelHelper from '../../helpers/models.js';
import { uploadToLinode } from '../../../aws_sdk/setup.js';

const modelName = 'userSetting';

export default class UserSetting extends ModelHelper {
  constructor(userSettingData) {
    super(`${modelName}s`);
    this.modelFields = {
      
    };
    if (userSettingData) {
      for (let key in this.modelFields) {
        if (userSettingData[key] !== undefined) {
          this.modelFields[key].value = userSettingData[key];
        }
      }
    }
  }

  static getModelFields() {
    return Object.keys(new UserSetting().modelFields).map((key) => {
      const field = new UserSetting().modelFields[key];
      return { name: key, type: field.type };
    });
  }

  async uploadImagesToLinode(req, res, next) {
    try {
      if (req.files) {
        for (const key in req.files) {
          const file = req.files[key][0];
          const fileKey = `${modelName}s/${Date.now()}-${file.originalname}`;
          const url = await uploadToLinode(file.path, fileKey);
          req.body[key] = url; // Save the URL in the request body
        }
      }
      next();
    } catch (error) {
      console.error('Error in uploadImagesToLinode middleware:', error);
      next(error);
    }
  }

  pathForGetRouteView() {
    return `admin/${modelName}s/template`;
  }
}
