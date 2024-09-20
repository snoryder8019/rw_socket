import ModelHelper from '../helpers/models.js';
import { upload, processImages } from '../../multer/subscriptionSetup.js';
import { uploadToLinode } from '../../aws_sdk/setup.js';

export default class Ticket extends ModelHelper {
  constructor(ticketData) {
    super('tickets');
    this.modelFields = {
      userId: { type: 'ObjectId', value: null },
      subject: { type: 'text', value: null },
      description: { type: 'textarea', value: null },
      status: { type: 'text', value: 'open' }, // default to 'open'
      priority: { type: 'text', value: 'normal' },
      attachments: { type: 'file', value: null }, 
      createdDate: { type: 'date', value: null },
      updatedDate: { type: 'date', value: null },
      closedDate: { type: 'date', value: null },
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
      this.uploadAttachmentsToLinode.bind(this),
    ];
  }

  middlewareForEditRoute() {
    return [
      upload.fields(this.fileFields),
      processImages,
      this.uploadAttachmentsToLinode.bind(this),
    ];
  }

  get fileFields() {
    return [
      { name: 'attachments', maxCount: 10 }, // Allow multiple attachments
    ];
  }

  async uploadAttachmentsToLinode(req, res, next) {
    try {
      if (req.files && req.files.attachments) {
        req.body.attachments = [];
        for (const file of req.files.attachments) {
          const fileKey = `tickets/${Date.now()}-${file.originalname}`;
          const url = await uploadToLinode(file.path, fileKey);
          req.body.attachments.push(url);
        }
      }
      next();
    } catch (error) {
      console.error('Error in uploadAttachmentsToLinode middleware:', error);
      next(error);
    }
  }

  pathForGetRouteView() {
    return 'userDash/tickets/template';
  }
}
