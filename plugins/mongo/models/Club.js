const ModelHelper = require('../helpers/models');
const { upload, processImages } = require('../../multer/subscriptionSetup');
const { uploadToLinode } = require('../../aws_sdk/setup');

class Club extends ModelHelper {
  constructor(clubData) {
    super('clubs');
    this.modelFields = {
      name: { type: 'text', value: null },
      authTitle: { type: 'text', value: null },
      nonAuthTitle: { type: 'text', value: null },
      authSubtitle: { type: 'text', value: null },
      nonAuthSubtitle: { type: 'text', value: null },
      authDescription: { type: 'textarea', value: null },
      nonAuthDescription: { type: 'textarea', value: null },
      callToAction: { type: 'text', value: null },
      price: { type: 'number', value: null },
      subLength: { type: 'number', value: null },
      creationDate: { type: 'date', value: null },
      mediumIcon: { type: 'file', value: null },
      squareNonAuthBkgd: { type: 'file', value: null },
      squareAuthBkgd: { type: 'file', value: null },
      horizNonAuthBkgd: { type: 'file', value: null },
      horizAuthBkgd: { type: 'file', value: null },
      entryUrl: { type: 'text', value: null },
      entryText: { type: 'text', value: null },
      updatedDate: { type: 'date', value: null },
      status: { type: 'text', value: null },
      visible: { type: 'boolean', value: null },
      tags: { type: 'text', value: null },  // Assuming comma-separated string for simplicity
      links: { type: 'text', value: null },  // Assuming comma-separated string for simplicity
      blogs: { type: 'text', value: null },  // Assuming comma-separated string for simplicity
      vendors: { type: 'text', value: null },  // Assuming comma-separated string for simplicity
      members: { type: 'text', value: null }  // Assuming comma-separated string for simplicity
    };

    if (clubData) {
      for (let key in this.modelFields) {
        if (clubData[key] !== undefined) {
          this.modelFields[key].value = clubData[key];
        }
      }
    }
  }

  static getModelFields() {
    return Object.keys(new Club().modelFields).map(key => {
      const field = new Club().modelFields[key];
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
          const fileKey = `clubs/${Date.now()}-${file.originalname}`;
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
    return 'admin/clubs/template';
  }
}

module.exports = Club;
