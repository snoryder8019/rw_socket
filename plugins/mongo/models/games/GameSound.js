import ModelHelper from '../../helpers/models.js';
import { upload, processImages } from '../../../multer/subscriptionSetup.js';
import { uploadToLinode } from '../../../aws_sdk/setup.js';

export default class GameSound extends ModelHelper {
  constructor(soundData) {
    super('gameSounds');
    this.modelFields = {
      title: { type: 'string', value: '' }, // Title of the sound effect
      soundFile: { type: 'file', value: null }, // File property for the sound effect (MP3)
      duration: { type: 'number', value: 0 }, // Duration of the sound in seconds
      category: { type: 'string', value: '' }, // Category of the sound (e.g., 'explosion', 'jump', etc.)
    };

    if (soundData) {
      for (let key in this.modelFields) {
        if (soundData[key] !== undefined) {
          this.modelFields[key].value = soundData[key];
        }
      }
    }
  }

  static getModelFields() {
    return Object.keys(new GameSound().modelFields).map((key) => {
      const field = new GameSound().modelFields[key];
      return { name: key, type: field.type };
    });
  }

  middlewareForCreateRoute() {
    return [
      upload.fields(this.fileFields),
      processImages,
      this.uploadFilesToLinode.bind(this),
    ];
  }

  middlewareForEditRoute() {
    return [
      upload.fields(this.fileFields),
      processImages,
      this.uploadFilesToLinode.bind(this),
    ];
  }

  get fileFields() {
    return [
      { name: 'soundFile', maxCount: 1 }, // Allow uploading one sound file
    ];
  }

  async uploadFilesToLinode(req, res, next) {
    try {
      if (req.files && req.files.soundFile) {
        const file = req.files.soundFile[0];
        const fileKey = `gameSounds/${Date.now()}-${file.originalname}`;
        const url = await uploadToLinode(file.path, fileKey);
        req.body.soundFile = url; // Save the URL in the request body
      }
      next();
    } catch (error) {
      console.error('Error in uploadFilesToLinode middleware:', error);
      next(error);
    }
  }

  pathForGetRouteView() {
    return 'admin/gameSounds/template';
  }
}
