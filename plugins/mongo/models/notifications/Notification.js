const ModelHelper = require('../../helpers/models');
const { upload, processImages } = require('../../../multer/subscriptionSetup');
const { uploadToLinode } = require('../../../aws_sdk/setup');
const modelName = 'notification';

class Notification extends ModelHelper {
  constructor(notificationData) {
    super(`${modelName}s`);
    this.modelFields = {
      type: { type: 'text', value: null },
      actionTrigger: { type: 'array', value: [] },
      sender: { type: 'text', value: null },
      draft: { type: 'boolean', value: null },
      sent: { type: 'boolean', value: null },
      created: { type: 'date', value: null },
      backgroundImg: { type: 'file', value: null },
      iconImage: { type: 'file', value: null },
      originalMessage: { type: 'text', value: null },
      subtitle: { type: 'text', value: null },
      title: { type: 'text', value: null },
      intervalSent: { type: 'text', value: null },
      seenBy: { type: 'array', value: [] },
      actionBy: { type: 'array', value: [] },
      actionHookBy: { type: 'array', value: [] },
      recycle: { type: 'boolean', value: null }
    };
    if (notificationData) {
      for (let key in this.modelFields) {
        if (notificationData[key] !== undefined) {
          this.modelFields[key].value = notificationData[key];
        }
      }
    }
  }

  static getModelFields() {
    return Object.keys(new Notification().modelFields).map(key => {
      const field = new Notification().modelFields[key];
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
      { name: 'iconImage', maxCount: 1 }
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

module.exports = Notification;
