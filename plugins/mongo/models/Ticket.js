import ModelHelper from '../helpers/models.js';
import { upload, processImages } from '../../multer/subscriptionSetup.js';
import { uploadToLinode } from '../../aws_sdk/setup.js';

export default class Ticket extends ModelHelper {
  constructor(ticketData) {
    super('tickets');
    this.modelFields = {
      subject: { type: 'text', value: null },
      description: { type: 'textarea', value: null },
      status: { type: 'text', value: 'open' }, // 'open', 'in progress', 'closed'
      priority: { type: 'text', value: 'medium' }, // 'low', 'medium', 'high'
      assignedTo: { type: 'text', value: null }, // User ID or name
      createdDate: { type: 'date', value: new Date() },
      updatedDate: { type: 'date', value: null },
      attachments: { type: 'array', value: [] }, // Array of file URLs
      mediumIcon: { type: 'file', value: null }, // Optional: a specific icon for ticket type
    };

    if (ticketData) {
      for (let key in this.modelFields) {
        if (ticketData[key] !== undefined) {
          this.modelFields[key].value = ticketData[key];
        }
      }
    }
  }

  static getModelFields() {
    return Object.keys(new Ticket().modelFields).map((key) => {
      const field = new Ticket().modelFields[key];
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
      { name: 'attachments', maxCount: 5 },
      { name: 'mediumIcon', maxCount: 1 },
    ];
  }

  async uploadImagesToLinode(req, res, next) {
    try {
      if (req.files) {
        for (const key in req.files) {
          const file = req.files[key][0];
          const fileKey = `tickets/${Date.now()}-${file.originalname}`;
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
    return 'admin/tickets/template';
  }
}
