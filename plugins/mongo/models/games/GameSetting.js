import ModelHelper from '../../helpers/models.js';
import Game from './Game.js';
import { upload, processImages } from '../../../multer/subscriptionSetup.js';
import { uploadToLinode } from '../../../aws_sdk/setup.js';

export default class GameSetting extends ModelHelper {
  constructor(settingData) {
    super('gameSettings');

    // Initialize with only the properties that need to be altered
    this.modelFields = {
      settingKey: { type: 'text', value: null }, // e.g., 'difficulty', 'graphicsQuality'
      settingValue: { type: 'text', value: null }, // The value of the setting
    };

    if (settingData) {
      for (let key in this.modelFields) {
        if (settingData[key] !== undefined) {
          this.modelFields[key].value = settingData[key];
        }
      }
    }
  }

  static getModelFields() {
    // Return only fields relevant to game settings
    return Object.keys(new GameSetting().modelFields).map((key) => {
      const field = new GameSetting().modelFields[key];
      return { name: key, type: field.type };
    });
  }

  middlewareForCreateRoute() {
    return [
      upload.fields(this.fileFields),
      processImages,
      this.uploadImagesToLinode.bind(this),
    ];
  }

  middlewareForEditRoute() {
    return [
      upload.fields(this.fileFields),
      processImages,
      this.uploadImagesToLinode.bind(this),
    ];
  }

  get fileFields() {
    // File fields might not be necessary for settings, but included if needed
    return [];
  }

  async uploadImagesToLinode(req, res, next) {
    try {
      if (req.files) {
        for (const key in req.files) {
          const file = req.files[key][0];
          const fileKey = `gameSettings/${Date.now()}-${file.originalname}`;
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
    return 'admin/gameSettings/template';
  }
}
