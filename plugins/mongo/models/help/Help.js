const ModelHelper = require('../../helpers/models');
const { upload, processImages } = require('../../../multer/subscriptionSetup');
const { uploadToLinode } = require('../../../aws_sdk/setup');

class Help extends ModelHelper {
  constructor(helpData) {
    super('helps');
    this.modelFields = {
      title: { type: 'text', value: null },
      content: { type: 'textarea', value: null },           // Main help content
      imageUrl: { type: 'text', value: null },              // URL to an image if any
      videoUrl: { type: 'text', value: null },              // URL to a video if any
      category: { type: 'text', value: null },              // Category for better organization
      tags: { type: 'array', value: [] },                   // Tags for searching and filtering
      creationDate: { type: 'date', value: new Date() },
      lastUpdated: { type: 'date', value: null },
      visible: { type: 'boolean', value: true },            // If the help content is currently visible
      order: { type: 'number', value: null },               // For ordering content in the UI
    };

    if (helpData) {
      for (let key in this.modelFields) {
        if (helpData[key] !== undefined) {
          this.modelFields[key].value = helpData[key];
        }
      }
    }
  }

  static getModelFields() {
    return Object.keys(new Help().modelFields).map(key => {
      const field = new Help().modelFields[key];
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
      { name: 'imageUrl', maxCount: 1 }
    ];
  }

  async uploadImagesToLinode(req, res, next) {
    try {
      if (req.files && req.files.imageUrl) {
        const file = req.files.imageUrl[0];
        const fileKey = `helps/${Date.now()}-${file.originalname}`;
        const url = await uploadToLinode(file.path, fileKey);
        req.body.imageUrl = url; // Save the URL in the request body
      }
      next();
    } catch (error) {
      console.error("Error in uploadImagesToLinode middleware:", error);
      next(error);
    }
  }

  pathForGetRouteView() {
    return 'admin/helps/template';
  }
}

module.exports = Help;
