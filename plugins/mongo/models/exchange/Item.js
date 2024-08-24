const ModelHelper = require('../../helpers/models');
const { upload, processImages } = require('../../../multer/subscriptionSetup');
const { uploadToLinode } = require('../../../aws_sdk/setup');
const modelName = 'item';

class Item extends ModelHelper {
  constructor(itemData) {
    super(`${modelName}s`);
    this.modelFields = {
      name: { type: 'text', value: null },                  // Name of the item
      description: { type: 'textarea', value: null },       // Description of the item
      imageUrl: { type: 'text', value: null },              // URL of the item's image
      priceInGems: { type: 'number', value: null },         // Price of the item in gems
      category: { type: 'text', value: null },              // Category of the item
      available: { type: 'boolean', value: true },          // Availability status
      creationDate: { type: 'date', value: new Date() },    // Date the item was created
      lastUpdated: { type: 'date', value: null },           // Date the item was last updated
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
    return Object.keys(new Item().modelFields).map(key => {
      const field = new Item().modelFields[key];
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
        const fileKey = `${modelName}s/${Date.now()}-${file.originalname}`;
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
    return `admin/${modelName}s/template`;
  }
}

module.exports = Item;
