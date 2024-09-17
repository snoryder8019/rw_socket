import ModelHelper from '../../helpers/models.js';
import { upload, processImages } from '../../../multer/subscriptionSetup.js';
import { uploadToLinode } from '../../../aws_sdk/setup.js';

export default class Excursion extends ModelHelper {
  constructor(excursionData) {
    super('excursions');
    this.modelFields = {
      title: { type: 'text', value: null },
      description: { type: 'textarea', value: null },
      location: { type: 'text', value: null },
      content: { type: 'text', value: null },

      duration: { type: 'number', value: null }, // Duration in hours/days
      cost: { type: 'number', value: null },
      itinerary: { type: 'array', value: [] }, // Array of itinerary items
      departureDate: { type: 'date', value: null },
      returnDate: { type: 'date', value: null },
      meetingPoint: { type: 'text', value: null },
      includedItems: { type: 'array', value: [] }, // Array of items included in the excursion (e.g., meals, equipment)
      notIncludedItems: { type: 'array', value: [] }, // Array of items not included
      images: { type: 'array', value: [] }, // Array of image URLs
      availableSpots: { type: 'number', value: null },
      status: { type: 'text', value: null }, // e.g., 'Available', 'Fully Booked', 'Cancelled'
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
    return Object.keys(new Excursion().modelFields).map((key) => {
      const field = new Excursion().modelFields[key];
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
      { name: 'images', maxCount: 10 },
    ];
  }

  async uploadImagesToLinode(req, res, next) {
    try {
      if (req.files) {
        for (const key in req.files) {
          const file = req.files[key][0];
          const fileKey = `excursions/${Date.now()}-${file.originalname}`;
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
    return 'admin/excursions/template';
  }
}
