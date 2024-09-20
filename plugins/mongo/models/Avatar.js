import ModelHelper from '../helpers/models.js';
import { upload, processImages } from '../../multer/subscriptionSetup.js';
import { uploadToLinode } from '../../aws_sdk/setup.js';

export default class Avatar extends ModelHelper {
  constructor(avatarData) {
    super('avatars');
    this.modelFields = {
      usid: { type: 'text', value: null },
      avatarUrl: { type: 'text', value: null },
      avatar: { type: 'file', value: null }, 
      altText: { type: 'text', value: null },
    };

    if (avatarData) {
      for (let key in this.modelFields) {
        if (avatarData[key] !== undefined) {
          this.modelFields[key].value = avatarData[key];
        }
      }
    }
  }

  static getModelFields() {
    return Object.keys(new Avatar().modelFields).map((key) => {
      const field = new Avatar().modelFields[key];
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
      { name: 'avatar', maxCount: 1 },
    ];
  }

  async uploadImagesToLinode(req, res, next) {
    try {
      if (req.files && req.files.avatar) {
        const file = req.files.avatar[0];
        const fileKey = `avatars/${Date.now()}-${file.originalname}`;
        const url = await uploadToLinode(file.path, fileKey);
        req.body.avatarUrl = url;
      }
      next();
    } catch (error) {
      console.error('Error in uploadImagesToLinode middleware:', error);
      next(error);
    }
  }

  pathForGetRouteView() {
    return 'userDash/avatars/template';
  }
}
