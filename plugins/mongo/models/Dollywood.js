import ModelHelper from '../helpers/models.js';
import { upload, processImages } from '../../multer/subscriptionSetup.js';
import { uploadToLinode } from '../../aws_sdk/setup.js';

export default class Dollywood extends ModelHelper {
  constructor(dollywoodData) {
    super('dollywoods');
    this.modelFields = {
      name: { type: 'text', value: null },
      title: { type: 'text', value: null },
      subtitle: { type: 'text', value: null },
      description: { type: 'textarea', value: null },
      callToAction: { type: 'text', value: null },
      price: { type: 'number', value: null },
      content: { type: 'textarea', value: null },
      order:{type:'number',value:null},

      subLength: { type: 'number', value: null },
      creationDate: { type: 'date', value: null },
      mediumIcon: { type: 'file', value: null },
      backgroundImg: { type: 'file', value: null },
      horizBkgd: { type: 'file', value: null },
      entryUrl: { type: 'text', value: null },
      entryText: { type: 'text', value: null },
      updatedDate: { type: 'date', value: null },
      status: { type: 'text', value: null },
      visible: { type: 'boolean', value: false },
      premium: { type: 'boolean', value: false },
      cost: { type: 'number', value: null },
      duration: { type: 'text', value: null },
      tags: { type: 'array', value: [] }, // Assuming comma-separated string for simplicity
      links: { type: 'array', value: [] }, // Assuming comma-separated string for simplicity
      blogs: { type: 'array', value: [] }, // Assuming comma-separated string for simplicity
      vendors: { type: 'array', value: [] }, // Assuming comma-separated string for simplicity
      members: { type: 'array', value: [] }, // Assuming comma-separated string for simplicity
    };

    if (dollywoodData) {
      for (let key in this.modelFields) {
        if (dollywoodData[key] !== undefined) {
          this.modelFields[key].value = dollywoodData[key];
        }
      }
    }
  }

  static getModelFields() {
    return Object.keys(new Dollywood().modelFields).map((key) => {
      const field = new Dollywood().modelFields[key];
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
          const fileKey = `dollywoods/${Date.now()}-${file.originalname}`;
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
    return 'admin/dollywoods/template';
  }
}
