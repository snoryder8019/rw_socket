import ModelHelper from '../../helpers/models.js';
import { upload, processImages } from '../../../multer/subscriptionSetup.js';
import { uploadToLinode } from '../../../aws_sdk/setup.js';


export default class Destination extends ModelHelper {
  constructor(destinationData) {
    super('destinations');
    this.modelFields = {
      name: { type: 'text', value: null },
      title: { type: 'text', value: null },
      content: { type: 'text', value: null },

      subTitle: { type: 'text', value: null },
      description: { type: 'textarea', value: null },
      location: { type: 'text', value: null },
      country: { type: 'text', value: null },
      attractions: { type: 'array', value: [] }, // List of major attractions at the destination
      bestTimeToVisit: { type: 'text', value: null }, // Best time of the year to visit
      activities: { type: 'array', value: [] }, // Popular activities at the destination
      averageCost: { type: 'number', value: null }, // Average cost for visiting
      travelTips: { type: 'array', value: [] }, // Travel tips and recommendations
      status: { type: 'text', value: null }, // e.g., 'Active', 'Inactive'
      mediumIcon: { type: 'file', value: null }, // Custom image field for medium-sized icons
      backgroundImg: { type: 'file', value: null }, // Background image for the destination
      horizBkgd: { type: 'file', value: null }, // Horizontal background image
      links: { type: 'array', value: [] }, // Horizontal background image
      featureImg: { type: 'file', value: null }, // Horizontal background image
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
    return Object.keys(new Destination().modelFields).map((key) => {
      const field = new Destination().modelFields[key];
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
      { name: 'featureImg', maxCount: 1 },
    ];
  }

  async uploadImagesToLinode(req, res, next) {
    try {
      if (req.files) {
        for (const key in req.files) {
          const file = req.files[key][0];
          const fileKey = `destinations/${Date.now()}-${file.originalname}`;
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
    return 'admin/destinations/template';
  }
}
