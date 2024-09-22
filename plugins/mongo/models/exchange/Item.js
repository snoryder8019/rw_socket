import ModelHelper from '../../helpers/models.js';
import { upload, processImages } from '../../../multer/subscriptionSetup.js';

import { uploadToLinode } from '../../../aws_sdk/setup.js';

const modelName = 'item';

export default class Item extends ModelHelper {
  constructor(itemData) {
    super(`${modelName}s`);
    this.modelFields = {
      name: { type: 'string',value:null },
      description: { type: 'string',value:null },
      imageUrl: { type: 'string',value:null },
      price: { type: 'number',value:null },
      backgroundImg: { type: 'file', value: null },
      mediumIcon: { type: 'file', value: null },
      available: { type: 'boolean' ,value:null}
    };
    if (itemData) {
      for (let key in this.modelFields) {
        if (itemData[key] !== undefined) {
          this.modelFields[key].value = itemData[key];
        }
      }
    }
  }

  static getModelFields() {
    return Object.keys(new Item().modelFields).map((key) => {
      const field = new Item().modelFields[key];
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
      //  { name: 'mediumIcon', maxCount: 1 },
      { name: 'backgroundImg', maxCount: 1 },
      { name: 'mediumIcon', maxCount: 1 },
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

  static async uploadToLinode(filePath, fileKey) {
    try {
      const url = await uploadToLinode(filePath, fileKey);
      return url;
    } catch (error) {
      console.error('Error uploading to Linode:', error);
      throw error;
    }
  }

  pathForGetRouteView() {
    return `admin/${modelName}s/template`;
  }
}
