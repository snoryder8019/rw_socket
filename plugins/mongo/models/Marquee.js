import ModelHelper from '../helpers/models.js';
import { upload, processImages } from '../../multer/subscriptionSetup.js';
import { uploadToLinode } from '../../aws_sdk/setup.js';

export default class Marquee extends ModelHelper {
  constructor(marqueeData) {
    super('marquees');
    this.modelFields = {
      title: { type: 'text', value: null },
      description: { type: 'textarea', value: null },
      linkUrl: { type: 'text', value: null }, // URL for marquee link
      startDate: { type: 'date', value: null }, // Start date for display
      endDate: { type: 'date', value: null }, // End date for display
      active: { type: 'boolean', value: false }, // Whether the marquee is active or not
      priority: { type: 'number', value: null }, // Priority for marquee display order
      mediumIcon: { type: 'file', value: null }, // Custom image field for medium-sized icons
      backgroundImg: { type: 'file', value: null }, // Background image for the marquee
      horizBkgd: { type: 'file', value: null }, // Horizontal background image
    };

    if (marqueeData) {
      for (let key in this.modelFields) {
        if (marqueeData[key] !== undefined) {
          this.modelFields[key].value = marqueeData[key];
        }
      }
    }
  }

  static getModelFields() {
    return Object.keys(new Marquee().modelFields).map((key) => {
      const field = new Marquee().modelFields[key];
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
      { name: 'backgroundImg', maxCount: 1 },
      { name: 'horizBkgd', maxCount: 1 },
    ];
  }

  async uploadImagesToLinode(req, res, next) {
    try {
      if (req.files) {
        for (const key in req.files) {
          const file = req.files[key][0];
          const fileKey = `marquees/${Date.now()}-${file.originalname}`;
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
    return 'admin/marquees/template';
  }
}
