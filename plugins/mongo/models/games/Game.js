import ModelHelper from '../../helpers/models.js';
import { upload, processImages } from '../../../multer/subscriptionSetup.js';
import { uploadToLinode } from '../../../aws_sdk/setup.js';

export default class Game extends ModelHelper {
  constructor(gameData) {
    super('games');
    this.modelFields = {
      name: { type: 'text', value: null },
      title: { type: 'text', value: null },
      subTitle: { type: 'text', value: null },
      description: { type: 'text', value: null },
      genre: { type: 'text', value: null },
      gameType: { type: 'text', value: null },
      ruleSet: { type: 'text', value: null },
      customRules: { type: 'text', value: null },
      developer: { type: 'text', value: null },
      releaseDate: { type: 'date', value: null },
      iconImage: { type: 'file', value: null },
      featureImage: { type: 'file', value: null },
      mediumIcon: { type: 'file', value: null },
      horizBkgd: { type: 'file', value: null },
      backgroundImg: { type: 'file', value: null },
    };

    if (gameData) {
      for (let key in this.modelFields) {
        if (gameData[key] !== undefined) {
          this.modelFields[key].value = gameData[key];
        }
      }
    }
  }

  static getModelFields() {
    return Object.keys(new Game().modelFields).map((key) => {
      const field = new Game().modelFields[key];
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
    return [
      { name: 'iconImage', maxCount: 1 },
      { name: 'featureImage', maxCount: 1 },
      { name: 'mediumIcon', maxCount: 1 },
      { name: 'horizBkgd', maxCount: 1 },
      { name: 'backgroundImg', maxCount: 1 },
    ];
  }

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
      console.error('Error in uploadImagesToLinode middleware:', error);
      next(error);
    }
  }

  pathForGetRouteView() {
    return 'admin/games/template';
  }
}
