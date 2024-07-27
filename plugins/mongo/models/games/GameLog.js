const ModelHelper = require('../helpers/models');
const { upload, processImages } = require('../../multer/subscriptionSetup');
const { uploadToLinode } = require('../../aws_sdk/setup');

class GameLogs extends ModelHelper {
    constructor(gameLogsData){
        super('game_logs');
        if(gameLogsData){
            this.name = gameLogsData.name;
       //types gameroomactivity,gamessession activity, launcher activity, gameroom activity, errors, highscrores, acheivements

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
          const fileKey = `gameLogs/${Date.now()}-${file.originalname}`;
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
    return 'admin/gameLogs/template';
  }
}

module.exports = GameLogs;
