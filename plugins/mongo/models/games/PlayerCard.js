const ModelHelper = require('../../helpers/models');
const { upload, processImages } = require('../../../multer/subscriptionSetup');
const { uploadToLinode } = require('../../../aws_sdk/setup');
const modelName = 'playerCard';

class PlayerCard extends ModelHelper {
  constructor(playerCardData) {
    super(`${modelName}s`);
    this.modelFields = {
      playerId: { type: 'text', value: null },
      playerName: { type: 'text', value: null },
      avatarImage: { type: 'file', value: null },
      level: { type: 'number', value: null },
      experiencePoints: { type: 'number', value: null },
      achievements: { type: 'array', value: [] },
      games: { type: 'array', value: [] },
      wins: { type: 'number', value: null },
      losses: { type: 'number', value: null },

    };
    if (playerCardData) {
      for (let key in this.modelFields) {
        if (playerCardData[key] !== undefined) {
          this.modelFields[key].value = playerCardData[key];
        }
      }
    }
  }

  static getModelFields() {
    return Object.keys(new PlayerCard().modelFields).map(key => {
      const field = new PlayerCard().modelFields[key];
      return { name: key, type: field.type };
    });
  }

  middlewareForCreateRoute() {
    return [upload.fields(this.fileFields), processImages, this.uploadImagesToLinode.bind(this)];
  }

  middlewareForEditRoute() {
    return [upload.fields(this.fileFields), processImages, this.uploadImagesToLinode.bind(this)];
  }

  get fileFields() {
    return [
      { name: 'avatarImage', maxCount: 1 }
    ];
  }

  async uploadImagesToLinode(req, res, next) {
    try {
      if (req.files) {
        for (const key in req.files) {
          const file = req.files[key][0];
          const fileKey = `${modelName}s/${Date.now()}-${file.originalname}`;
          const url = await uploadToLinode(file.path, fileKey);
          req.body[key] = url; // Save the URL in the request body
        }
      }
      next();
    } catch (error) {
      console.error("Error in uploadImagesToLinode middleware:", error);
      next(error);
    }
  }

  pathForGetRouteView() {
    return `admin/${modelName}s/template`;
  }
}

module.exports = PlayerCard;
