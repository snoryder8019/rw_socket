import ModelHelper from '../../helpers/models.js';
import { upload, processImages } from '../../../multer/subscriptionSetup.js';
import { uploadToLinode } from '../../../aws_sdk/setup.js';

export default class UserImage extends ModelHelper {
  constructor(userImageData) {
    super('userImages');
    this.modelFields = {
      usid: { type: 'text', value: null }, // Reference to user.shortId
      userId: { type: 'text', value: null }, // Reference to user.shortId
      imageUrl: { type: 'text', value: null }, 
      image: { type: 'file', value: null }, 
      altText: { type: 'text', value: null },
      description: { type: 'textarea', value: null },
      uploadDate: { type: 'date', value: null },
      updatedDate: { type: 'date', value: null },
      status: { type: 'text', value: null },
      visible: { type: 'boolean', value: false },
      isAvatar: { type: 'boolean', value: false },  
    }; // Added closing brace here

    if (userImageData) {
      for (let key in this.modelFields) {
        if (userImageData[key] !== undefined) {  // Updated the reference to userImageData
          this.modelFields[key].value = userImageData[key];
        }
      }
    }
  }

  static getModelFields() {
    return Object.keys(new UserImage().modelFields).map((key) => {
      const field = new UserImage().modelFields[key];
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
      { name: 'image', maxCount: 1 }, // File field for image
    ];
  }

  async uploadImagesToLinode(req, res, next) {
    try {
      if (req.files && req.files.imageUrl) {
        const file = req.files.imageUrl[0];
        const fileKey = `userImages/${Date.now()}-${file.originalname}`;
        const url = await uploadToLinode(file.path, fileKey);
        req.body.imageUrl = url; // Save the URL in the request body
      }
      next();
    } catch (error) {
      console.error('Error in uploadImagesToLinode middleware:', error);
      next(error);
    }
  }

  pathForGetRouteView() {
    return 'userDash/userImages/template';
  }
}
