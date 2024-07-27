const ModelHelper = require('../helpers/models');
const { upload, processImages } = require('../../multer/subscriptionSetup');
const { uploadToLinode } = require('../../aws_sdk/setup');

class GameSession extends ModelHelper {
    constructor(gameSessionData){
        super('game_sessions');
        if(gameSessionData){
            this.name = gameSessionData.name;
       //players{socres outcomeRank}, open close time, outcome, plays, chatroom,flags, tags, shares,
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
          const fileKey = `gameSessions/${Date.now()}-${file.originalname}`;
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
    return 'admin/gameSession/template';
  }
}

module.exports = GameSession;
