import ModelHelper from '../../helpers/models.js';
import { upload, processImages } from '../../../multer/subscriptionSetup.js';
import { uploadToLinode } from '../../../aws_sdk/setup.js';

const modelName = 'launcher';

export default class Launcher extends ModelHelper {
  constructor(launcherData) {
    super(`${modelName}s`);
    this.modelFields = {
      name: { type: 'text', value: null },
      description: { type: 'text', value: null },
      version: { type: 'text', value: null },
      downloadUrl: { type: 'text', value: null },
      iconImage: { type: 'file', value: null },
      backgroundImg: { type: 'file', value: null },
    };
    if (launcherData) {
      for (let key in this.modelFields) {
        if (launcherData[key] !== undefined) {
          this.modelFields[key].value = launcherData[key];
        }
      }
    }
  }

  static getModelFields() {
    return Object.keys(new Launcher().modelFields).map((key) => {
      const field = new Launcher().modelFields[key];
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
    return [
      { name: 'iconImage', maxCount: 1 },
      { name: 'backgroundImg', maxCount: 1 },
    ];
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
