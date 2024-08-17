const ModelHelper = require('../helpers/models');
const { upload, processImages } = require('../../multer/subscriptionSetup');
const { uploadToLinode } = require('../../aws_sdk/setup');
const modelName = 'destination';

class Destination extends ModelHelper {
  constructor(travelData) {
    super(`${modelName}s`);
    this.modelFields = {
      name: { type: 'text', value: null },
      mediumIcon: { type: 'file', value: null },
      backgroundImg: { type: 'file', value: null },
      horizBkgd: { type: 'file', value: null },
     
    };
    if (destinationData) {
      for (let key in this.modelFields) {
        if (destinationData[key] !== undefined) {
          this.modelFields[key].value = destinationData[key];
        }
      }
    }
  }

  static getModelFields() {
    return Object.keys(new Destination().modelFields).map(key => {
      const field = new Destination().modelFields[key];
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
      console.error("Error in uploadImagesToLinode middleware:", error);
      next(error);
    }
  }

  pathForGetRouteView() {
    return `admin/${modelName}s/template`;
  }
}

module.exports = Destination;
