import ModelHelper from '../helpers/models.js';
import { upload, processImages } from '../../multer/subscriptionSetup.js';
import { uploadToLinode } from '../../aws_sdk/setup.js';

const modelName = 'vendor';

export default class Vendor extends ModelHelper {
  constructor(vendorData) {
    super(`${modelName}s`);
    this.modelFields = {
      name: { type: 'text', value: null },
      title: { type: 'text', value: null },
      subtitle: { type: 'text', value: null },
      links: { type: 'array', value: [] },
      promos: { type: 'array', value: [] },
      clubs: { type: 'array', value: [] },
      content: { type: 'text', value: null },

      description: { type: 'text', value: null },
      mediumIcon: { type: 'file', value: null },
      backgroundImg: { type: 'file', value: null },
      horizBkgd: { type: 'file', value: null },
      // email, contact, dropship--nancyShip--eventBased
      //conversion webhook
      //shopify webhook
      //shopify link
      //active
      //permissions
      //login
    };
    if (vendorData) {
      for (let key in this.modelFields) {
        if (vendorData[key] !== undefined) {
          this.modelFields[key].value = vendorData[key];
        }
      }
    }
  }

  static getModelFields() {
    return Object.keys(new Vendor().modelFields).map((key) => {
      const field = new Vendor().modelFields[key];
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
      { name: 'backgroundImg', maxCount: 1 },
      { name: 'horizBkgrd', maxCount: 1 },
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
