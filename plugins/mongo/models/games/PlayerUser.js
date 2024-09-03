import ModelHelper from '../../helpers/models.js';
import { upload, processImages } from '../../../multer/subscriptionSetup.js';
import { uploadToLinode } from '../../../aws_sdk/setup.js';

export default class PlayerUser extends ModelHelper {
  constructor(playerData) {
    super('playerUsers');
    this.modelFields = {
      playerId: { type: 'text', value: null },
      playerName: { type: 'text', value: null },
      level: { type: 'number', value: null },
      experiencePoints: { type: 'number', value: null },
      achievements: { type: 'array', value: [] },
      games: { type: 'array', value: [] },
      wins: { type: 'number', value: null },
      losses: { type: 'number', value: null },
    };

    if (playerData) {
      for (let key in this.modelFields) {
        if (playerData[key] !== undefined) {
          this.modelFields[key].value = playerData[key];
        }
      }
    }
  }

  static getModelFields() {
    return Object.keys(new PlayerUser().modelFields).map((key) => {
      const field = new PlayerUser().modelFields[key];
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
    // Define if you have file upload requirements for PlayerUser
    return [];
  }

  async uploadImagesToLinode(req, res, next) {
    try {
      if (req.files) {
        for (const key in req.files) {
          const file = req.files[key][0];
          const fileKey = `playerUsers/${Date.now()}-${file.originalname}`;
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
    return 'admin/playerUsers/template';
  }
}
