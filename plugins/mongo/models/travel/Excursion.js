const ModelHelper = require('../../helpers/models');
const { upload, processImages } = require('../../../multer/subscriptionSetup');
const { uploadToLinode } = require('../../../aws_sdk/setup');
const modelName = 'excursion';

class Excursion extends ModelHelper {
  constructor(excursionData) {
    super(`${modelName}s`);
    this.modelFields = {
      name: { type: 'text', value: null },
      title: { type: 'text', value: null },
      subtitle: { type: 'text', value: null },
      links: { type: 'array', value:[] },     
    };
    if (excursionData) {
      for (let key in this.modelFields) {
        if (excursionData[key] !== undefined) {
          this.modelFields[key].value = excursionData[key];
        }
      }
    }
  }

  static getModelFields() {
    return Object.keys(new Excursion().modelFields).map(key => {
      const field = new Excursion().modelFields[key];
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
      { name: 'squareNonAuthBkgd', maxCount: 1 },
      { name: 'squareAuthBkgd', maxCount: 1 },
      { name: 'horizNonAuthBkgd', maxCount: 1 },
      { name: 'horizAuthBkgd', maxCount: 1 }
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

module.exports = Excursion;
