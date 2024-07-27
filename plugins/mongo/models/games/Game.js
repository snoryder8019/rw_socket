const ModelHelper = require('../helpers/models');
const { upload, processImages } = require('../../multer/subscriptionSetup');
const { uploadToLinode } = require('../../aws_sdk/setup');

class Game extends ModelHelper {
    constructor(gameData){
        super('games');
        if(gameData){
            this.name = gameData.name;
            this.title = gameData.title;
            this.subtitle = gameData.subtitle;
            this.ruleset = gameData.ruleset;
            this.bkgrdImage = gameData.bkgrdImage;
            this.iconImage = gameData.iconImage;
            this.created = gameData.created || new Date();
            this.highScore = gameData.highScore;
            this.leaderboard = gameData.leaderboard || [];
            this.assetPack = gameData.assetPack;
            this.stylePack = gameData.stylePack;
            

        }
    }

  // Right now this model is not using the route builder, but if it was this would be what the function would need to look like in order for it to work.
  middlewareForEditRoute() {
    return [upload.fields(this.fileFields), processImages, uploadToLinode];
  }

  middlewareForCreateRoute() {
    return [upload.fields(this.fileFields), processImages, this.uploadImagesToLinode];
  }

  fileFields = [
    { name: 'bkgrdImage', maxCount: 1 },
    { name: 'iconImage', maxCount: 1 },

  ];

  async uploadImagesToLinode(req, res, next) {
    try {
      if (req.files) {
        for (const key in req.files) {
          const file = req.files[key][0];
          const fileKey = `games/${Date.now()}-${file.originalname}`;
          const url = await uploadToLinode(file.path, fileKey);
          req.body[key] = url; // Save the URL in the request body
        }
      }
      next();
    } catch (error) {
      console.error("Error in uploadImagesToLinode middleware:", error);
      next(error);
    }
  };

  pathForGetRouteView() {
    return 'admin/game/template';
  }
}

module.exports = Game;
