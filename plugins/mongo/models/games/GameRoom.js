const ModelHelper = require('../../helpers/models');
const { upload, processImages } = require('../../../multer/subscriptionSetup');
const { uploadToLinode } = require('../../../aws_sdk/setup');
const modelName = 'gameRoom';

class GameRoom extends ModelHelper {
  constructor(gameRoomData) {
    super(`${modelName}s`);
    this.modelFields = {
      name: { type: 'text', value: null },
      gameType: { type: 'text', value: null },
      description: { type: 'text', value: null },
      backgroundImg: { type: 'file', value: null },
      mediumIcon: { type: 'file', value: null },
      playerIds: { type: 'array', value: [] },
      status: { type: 'text', value: null },
      maxPlayers: { type: 'number', value: null },
    };

    if (gameRoomData) {
      for (let key in this.modelFields) {
        if (gameRoomData[key] !== undefined) {
          this.modelFields[key].value = gameRoomData[key];
        }
      }
    }
  }

  static getModelFields() {
    return Object.keys(new GameRoom().modelFields).map(key => {
      const field = new GameRoom().modelFields[key];
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
      { name: 'backgroundImg', maxCount: 1 },
      { name: 'mediumIcon', maxCount: 1 },
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

module.exports = GameRoom;
