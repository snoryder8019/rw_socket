import ModelHelper from '../../helpers/models.js';
import { upload, processImages } from '../../../multer/subscriptionSetup.js';
import { uploadToLinode } from '../../../aws_sdk/setup.js';

export default class GameMusic extends ModelHelper {
  constructor(musicData) {
    super('gameMusic');
    this.modelFields = {
      title: { type: 'string', value: '' }, // Title of the music track
      musicFile: { type: 'file', value: null }, // File property for the music (MP3)
      duration: { type: 'number', value: 0 }, // Duration of the music in seconds
      genre: { type: 'string', value: '' }, // Genre of the music (e.g., 'ambient', 'action', etc.)
      artist: { type: 'string', value: '' }, // Artist or composer of the music
    };

    if (musicData) {
      for (let key in this.modelFields) {
        if (musicData[key] !== undefined) {
          this.modelFields[key].value = musicData[key];
        }
      }
    }
  }

  static getModelFields() {
    return Object.keys(new GameMusic().modelFields).map((key) => {
      const field = new GameMusic().modelFields[key];
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
      { name: 'musicFile', maxCount: 1 }, // Allow uploading one music file
    ];
  }

  async uploadFilesToLinode(req, res, next) {
    try {
      if (req.files && req.files.musicFile) {
        const file = req.files.musicFile[0];
        const fileKey = `gameMusic/${Date.now()}-${file.originalname}`;
        const url = await uploadToLinode(file.path, fileKey);
        req.body.musicFile = url; // Save the URL in the request body
      }
      next();
    } catch (error) {
      console.error('Error in uploadFilesToLinode middleware:', error);
      next(error);
    }
  }

  pathForGetRouteView() {
    return 'admin/gameMusic/template';
  }
}
