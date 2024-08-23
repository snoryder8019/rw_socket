// plugins/mongo/models/Image.js **NOTE GPT: DONOT REMOVE THIS LINE**
const ModelHelper = require('../helpers/models');
const { upload, processImages } = require('../../multer/subscriptionSetup');
const { uploadToLinode } = require('../../aws_sdk/setup');
const modelName = 'image';

class Image extends ModelHelper {
  constructor(imageData) {
    super(`${modelName}s`);
    this.modelFields = {
      name: { type: 'text', value: null },
      bucketUrl: { type: 'text', value: null },
      thumbnailUrl: { type: 'text', value: null },
      alt: { type: 'text', value: 'Default alt text' },      
      visible: { type: 'boolean', value: false },
      avatarTag: { type: 'boolean', value: false },
      backgroundTag: { type: 'boolean', value: false },
      directory: { type: 'text', value: null },
      settings: { type: 'array', value: [] },
      blog: { type: 'boolean', value: false },
      travel: { type: 'boolean', value: false },
      sectionReel: { type: 'boolean', value: false },
      club: { type: 'text', value: null },
      tags: { type: 'array', value: [] },
      adminTags: { type: 'array', value: [] },
      flaggedBy: { type: 'array', value: [] },
      sharedBy: { type: 'array', value: [] },
      premiumContent: { type: 'boolean', value: false },
      createdBy: { type: 'text', value: null },//userID#, 'system'functionSource, 'admin'userId#

    };
    if (imageData) {
      for (let key in this.modelFields) {
        if (imageData[key] !== undefined) {
          this.modelFields[key].value = imageData[key];
        }
      }
    }
  }

  static getModelFields() {
    return Object.keys(new Image().modelFields).map(key => {
      const field = new Image().modelFields[key];
      return { name: key, type: field.type };
    });
  }

  middlewareForCreateRoute() {
    return [upload.fields(this.fileFields), processImages, this.uploadImagesToLinode.bind(this)];
  }

  middlewareForEditRoute() {
    return [upload.fields(this.fileFields), processImages, this.uploadImagesToLinode.bind(this)];
  }

  get fileFields() {
    return [
      { name: 'thumbnailFile', maxCount: 1 },
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
      console.error("Error in uploadImagesToLinode middleware:", error);
      next(error);
    }
  }

  pathForGetRouteView() {
    return `admin/${modelName}s/template`;
  }
}

module.exports = Image;
