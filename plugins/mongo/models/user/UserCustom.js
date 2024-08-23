const ModelHelper = require('../helpers/models');
const { upload, processImages } = require('../../multer/subscriptionSetup');
const { uploadToLinode } = require('../../aws_sdk/setup');

class UserCustom extends ModelHelper {
  constructor(customData) {
    super('userCustoms');
    this.modelFields = {
      layout: { type: 'text', value: null },
      colorScheme: { type: 'text', value: null },
      backgroundImage: { type: 'file', value: null },
      font: { type: 'text', value: null },
      customCSS: { type: 'textarea', value: null },
      logo: { type: 'file', value: null },
      headerStyle: { type: 'text', value: null },
      footerStyle: { type: 'text', value: null },
      sidebarStyle: { type: 'text', value: null },
      buttonStyle: { type: 'text', value: null },
      iconSet: { type: 'text', value: null },
      animations: { type: 'array', value: [] },
      effects: { type: 'array', value: [] },
      widgetSettings: { type: 'array', value: [] },
      // Add more fields as necessary...
    };

    if (customData) {
      for (let key in this.modelFields) {
        if (customData[key] !== undefined) {
          this.modelFields[key].value = customData[key];
        }
      }
    }
  }

  static getModelFields() {
    return Object.keys(new UserCustom().modelFields).map(key => {
      const field = new UserCustom().modelFields[key];
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
      { name: 'backgroundImage', maxCount: 1 },
      { name: 'logo', maxCount: 1 },
    ];
  }

  async uploadImagesToLinode(req, res, next) {
    try {
      if (req.files) {
        for (const key in req.files) {
          const file = req.files[key][0];
          const fileKey = `userCustoms/${Date.now()}-${file.originalname}`;
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
    return 'admin/userCustoms/template';
  }
}

module.exports = UserCustom;
