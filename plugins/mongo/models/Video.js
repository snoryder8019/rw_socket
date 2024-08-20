const ModelHelper = require('../helpers/models');
const { upload, processImages } = require('../../multer/subscriptionSetup');
const { uploadToLinode } = require('../../aws_sdk/setup');
const modelName = 'video';

class Video extends ModelHelper {
  constructor(videoData) {
    super(`${modelName}s`);
    this.modelFields = {
      name: { type: 'text', value: null },
      url: { type: 'text', value: null },
      thumnail: { type: 'text', value: null },
      thumnailFile: { type: 'file', value: null },
   //premium content
   //club
   //tags
   //blog
   
     
    };
    if (videoData) {
      for (let key in this.modelFields) {
        if (videoData[key] !== undefined) {
          this.modelFields[key].value = videoData[key];
        }
      }
    }
  }

  static getModelFields() {
    return Object.keys(new Video().modelFields).map(key => {
      const field = new Video().modelFields[key];
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
      { name: 'thumbnailFile', maxCount: 1 },
 
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

module.exports = Video;
