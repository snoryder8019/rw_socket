import ModelHelper from '../../helpers/models.js';
import { upload, processImages } from '../../../multer/subscriptionSetup.js';
import { uploadToLinode } from '../../../aws_sdk/setup.js';

export default class Vote extends ModelHelper {
  constructor(voteData) {
    super('votes');
    this.modelFields = {
      
      name: { type: 'text', value: null },
      question: { type: 'text', value: null },
      options: { type: 'array', value: [] }, // Array of vote options
      voteType: { type: 'text', value: null },
      records: { type: 'array', value: [] }, // Array of user IDs who voted
      createdAt: { type: 'date', value: new Date() },
      updatedAt: { type: 'date', value: new Date() },
      content: { type: 'textarea', value: null },

    };

    if (voteData) {
      for (let key in this.modelFields) {
        if (voteData[key] !== undefined) {
          this.modelFields[key].value = voteData[key];
        }
      }
    }
  }

  static getModelFields() {
    return Object.keys(new Vote().modelFields).map((key) => {
      const field = new Vote().modelFields[key];
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
    return [];
  }

  async uploadImagesToLinode(req, res, next) {
    try {
      if (req.files) {
        for (const key in req.files) {
          const file = req.files[key][0];
          const fileKey = `votes/${Date.now()}-${file.originalname}`;
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
    return 'admin/votes/template';
  }
}
