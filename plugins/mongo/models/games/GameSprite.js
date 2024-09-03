import ModelHelper from '../../helpers/models.js';
import { upload, processImages } from '../../../multer/subscriptionSetup.js';
import { uploadToLinode } from '../../../aws_sdk/setup.js';

export default class GameSprite extends ModelHelper {
  constructor(spriteData) {
    super('gameSprites');
    this.modelFields = {
      name: { type: 'string', value: null }, // Grid type (e.g., '3x3')
      decsription: { type: 'string', value: null }, // Grid type (e.g., '3x3')
      
      imageSrc: { type: 'string', value: '' }, // Source URL of the sprite image (PNG, JPG, GIF)
      frames: { type: 'array', value: [] }, // Array to hold different frames of the sprite
      spriteFile: { type: 'file', value: null }, // File property for the sprite (e.g., sprite sheet)
    };

    if (spriteData) {
      for (let key in this.modelFields) {
        if (spriteData[key] !== undefined) {
          this.modelFields[key].value = spriteData[key];
        }
      }
    }
  }

  static getModelFields() {
    return Object.keys(new GameSprite().modelFields).map((key) => {
      const field = new GameSprite().modelFields[key];
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
      { name: 'spriteFile', maxCount: 1 }, // Allow uploading one sprite file
    ];
  }

  async uploadImagesToLinode(req, res, next) {
    try {
      if (req.files && req.files.spriteFile) {
        const file = req.files.spriteFile[0];
        const fileKey = `gameSprites/${Date.now()}-${file.originalname}`;
        const url = await uploadToLinode(file.path, fileKey);
        req.body.imageSrc = url; // Save the URL in the request body
      }
      next();
    } catch (error) {
      console.error('Error in uploadImagesToLinode middleware:', error);
      next(error);
    }
  }

  pathForGetRouteView() {
    return 'admin/gameSprites/template';
  }
}
