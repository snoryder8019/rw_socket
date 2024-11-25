import ModelHelper from '../helpers/models.js';
import { upload, processImages } from '../../multer/subscriptionSetup.js';
import { uploadToLinode } from '../../aws_sdk/setup.js';

const modelName = 'subscription';

export default class Subscription extends ModelHelper {
  constructor(subscriptionData) {
    super(`${modelName}s`);
    this.modelFields = {
      name: { type: 'text', value: null },
      type: { type: 'text', value: null },
      price: { type: 'number', value: null },
      startDate: { type: 'date', value: new Date() },
      endDate: { type: 'date', value: null },
      mediumIcon: { type: 'file', value: null },
      backgroundImg: { type: 'file', value: null },
      horizBkgd: { type: 'file', value: null },
      title: { type: 'text', value: null },
      description: { type: 'text', value: null },
      daysSubscribed: { type: 'number', value: null },
      gemsType: { type: 'text', value: null },
      gemsCt: { type: 'number', value: null },
      items: { type: 'array', value: [] },
      vendors: { type: 'array', value: [] },
      shopifyWebhook: { type: 'text', value: null },
      vendors: { type: 'array', value: [] },
      gameTokens: { type: 'number', value: null },
      active: { type: 'boolean', value: false },
    };
    if (subscriptionData) {
      for (let key in this.modelFields) {
        if (subscriptionData[key] !== undefined) {
          this.modelFields[key].value = subscriptionData[key];
        }
      }
    }
  }

  static getModelFields() {
    return Object.keys(new Subscription().modelFields).map((key) => {
      const field = new Subscription().modelFields[key];
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
      { name: 'horizBkgd', maxCount: 1 },
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
