import ModelHelper from '../../helpers/models.js';
import { upload, processImages } from '../../../multer/subscriptionSetup.js';
import { uploadToLinode } from '../../../aws_sdk/setup.js';

export default class Footer extends ModelHelper {
  constructor(footerData) {
    super('footers');
    this.modelFields = {
      companyName: { type: 'text', value: null },
      address: { type: 'textarea', value: null },
      phoneNumber: { type: 'text', value: null },
      email: { type: 'text', value: null },
      copyrightText: { type: 'text', value: null },
      socialMediaIcons: { type: 'array', value: [] }, // URLs to social media icons
      footerLinks: { type: 'array', value: [] }, // Links to important pages (e.g., Privacy Policy, Terms of Service)
      backgroundImage: { type: 'file', value: null },
      footerImage: { type: 'file', value: null },
      style: { type: 'textarea', value: null }, // Custom CSS for footer styling
      innerStyle: { type: 'textarea', value: null }, // Custom CSS for footer styling
      displayOrder: { type: 'number', value: null }, // Order of appearance in the footer section
    };

    if (footerData) {
      for (let key in this.modelFields) {
        if (footerData[key] !== undefined) {
          this.modelFields[key].value = footerData[key];
        }
      }
    }
  }

  static getModelFields() {
    return Object.keys(new Footer().modelFields).map((key) => {
      const field = new Footer().modelFields[key];
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
      { name: 'backgroundImage', maxCount: 1 },
      { name: 'footerImage', maxCount: 1 },
    ];
  }

  async uploadImagesToLinode(req, res, next) {
    try {
      if (req.files) {
        for (const key in req.files) {
          const file = req.files[key][0];
          const fileKey = `footers/${Date.now()}-${file.originalname}`;
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
    return 'admin/footers/template';
  }
}
