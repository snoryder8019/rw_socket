const ModelHelper = require('../helpers/models');
const { upload, processImages } = require('../../multer/subscriptionSetup');
const { uploadToLinode } = require('../../aws_sdk/setup');

class User extends ModelHelper {
  constructor(userData) {
    super('users');
    this.modelFields = {
      name: { type: 'text', value: null },
      title: { type: 'text', value: null },
      subtitle: { type: 'text', value: null },
      description: { type: 'textarea', value: null },
    };

    if (userData) {
      for (let key in this.modelFields) {
        if (userData[key] !== undefined) {
          this.modelFields[key].value = userData[key];
        }
      }
    }
  }

  static getModelFields() {
    return Object.keys(new User().modelFields).map(key => {
      const field = new User().modelFields[key];
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
      { name: 'horizBkgd', maxCount: 1 }
    ];
  }

  async uploadImagesToLinode(req, res, next) {
    try {
      if (req.files) {
        for (const key in req.files) {
          const file = req.files[key][0];
          const fileKey = `users/${Date.now()}-${file.originalname}`;
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
    return 'admin/users/template';
  }
}

module.exports = User;
