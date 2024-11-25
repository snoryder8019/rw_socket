import ModelHelper from '../../helpers/models.js';
import { upload, processImages } from '../../../multer/subscriptionSetup.js';
import { uploadToLinode } from '../../../aws_sdk/setup.js';

export default class Faq extends ModelHelper {
  constructor(faqData) {
    super('faqs');
    this.modelFields = {
      question: { type: 'text', value: null },
      answer: { type: 'textarea', value: null },
      category: { type: 'text', value: null }, // Optional: categorize FAQs
      isVisible: { type: 'boolean', value: true }, // FAQ visibility toggle
      order: { type: 'number', value: 0 }, // Order of display
      createdDate: { type: 'date', value: new Date() },
      updatedDate: { type: 'date', value: null },
      mediumIcon: { type: 'file', value: null },
      backgroundImg: { type: 'file', value: null },
      horizBkgd: { type: 'file', value: null },
    };

    if (faqData) {
      for (let key in this.modelFields) {
        if (faqData[key] !== undefined) {
          this.modelFields[key].value = faqData[key];
        }
      }
    }
  }

  static getModelFields() {
    return Object.keys(new Faq().modelFields).map((key) => {
      const field = new Faq().modelFields[key];
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
          const fileKey = `clubs/${Date.now()}-${file.originalname}`;
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
    return 'admin/faqs/template';
  }

}
