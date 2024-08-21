//plugins/mongo/models/User.js **GPT NOTE: DONT REMOVE THIS LINE IN EXAMPLES**
const ModelHelper = require('../helpers/models');
const { upload, processImages } = require('../../multer/subscriptionSetup');
const { uploadToLinode } = require('../../aws_sdk/setup');
const thumbnailFile = '/images/hugeIcon.png'
class User extends ModelHelper {
  constructor(userData) {
    super('users');
    this.modelFields = {
      isAdmin: { type: 'boolean', value: false },
      name: { type: 'text', value: null },
      title: { type: 'text', value: null },
      surname: { type: 'text', value: null },
      images: { type: 'array', value: [{thumbnailFile}] },
      bio: { type: 'textarea', value: null },      
      modelVersion: { type: 'text', value: "version 1"},
      providerId: { type: 'text', value: null },
      provider: { type: 'text', value: null },
      email: { type: 'text', value: null, },
      displayName: { type: 'text', value: `user:${new Date()}` },
      firstName: { type: 'text', value: null },
      lastName: { type: 'text', value: null },
      password: { type: 'text', value: null },
      permissions: { type: 'object', value: {} },
      wallet: { type: 'object', value: {
        emerald:0,
        sapphire:0,
        amethyst:0
      } },
      subscription: { type: 'text', value: "free" },
      gems: { type: 'number', value: 25 },
      cart: { type: 'array', value: [] },
      clubs: { type: 'array', value: [] },
      notifications: { type: 'array', value: [] },
    };

    if (userData) {
      for (let key in this.modelFields) {
        if (userData[key] !== undefined) {
          this.modelFields[key].value = userData[key];
        }
      }
    }
  }

  static getModelFields() {
    return Object.keys(new User().modelFields).map(key => {
      const field = new User().modelFields[key];
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
      { name: 'mediumIcon', maxCount: 1 },
      { name: 'backgroundImg', maxCount: 1 },
      { name: 'horizBkgd', maxCount: 1 }
    ];
  }

  async uploadImagesToLinode(req, res, next) {
    try {
      if (req.files) {
        for (const key in req.files) {
          const file = req.files[key][0];
          const fileKey = `users/${Date.now()}-${file.originalname}`;
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
    return 'admin/users/template';
  }
}

module.exports = User;
