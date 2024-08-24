import ModelHelper from '../helpers/models.js';
import { upload, processImages } from '../../multer/subscriptionSetup.js';
import { uploadToLinode } from '../../aws_sdk/setup.js';

const modelName = 'travel';

export default class Travel extends ModelHelper {
  constructor(travelData) {
    super(`${modelName}s`);
    this.modelFields = {
      name: { type: 'text', value: null },
      mediumIcon: { type: 'file', value: null },
      backgroundImg: { type: 'file', value: null },
      horizBkgd: { type: 'file', value: null },
    };
    if (travelData) {
      for (let key in this.modelFields) {
        if (travelData[key] !== undefined) {
          this.modelFields[key].value = travelData[key];
        }
      }
    }
  }

  static getModelFields() {
    return Object.keys(new Travel().modelFields).map((key) => {
      const field = new Travel().modelFields[key];
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
      { name: 'mediumIcon', maxCount: 1 },
      { name: 'squareNonAuthBkgd', maxCount: 1 },
      { name: 'squareAuthBkgd', maxCount: 1 },
      { name: 'horizNonAuthBkgd', maxCount: 1 },
      { name: 'horizAuthBkgd', maxCount: 1 },
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
