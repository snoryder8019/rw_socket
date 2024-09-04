import ModelHelper from '../../helpers/models.js';
import Game from './Game.js';
import { upload, processImages } from '../../../multer/subscriptionSetup.js';
import { uploadToLinode } from '../../../aws_sdk/setup.js';

export default class GameSetting extends ModelHelper {
  constructor(settingData) {
    super('gameSettings');

    // Initialize with only the properties that need to be altered
    this.modelFields = {
      name: { type: 'text', value: null }, 
      game: { type: 'text', value: null }, 
      socket: { type: 'text', value: null }, 
      active: { type: 'boolean', value: null },       
      maxPlayers: { type: 'text', value: null }, 
      minPlayers: { type: 'text', value: null }, 
      singlePlayer: { type: 'boolean', value: false }, // if Ai is programmed in
      customSetting: { type: 'boolean', value: false }, // if we had optional rulesets for the user
      backgroundImg: { type: 'file', value: null }, 
      dropElements: { type: 'array', value: [] }, 
      movableElements: { type: 'array', value: [] }, 
      ruleSet:{type:'array',value:[]}
      
      
    };

    if (settingData) {
      for (let key in this.modelFields) {
        if (settingData[key] !== undefined) {
          this.modelFields[key].value = settingData[key];
        }
      }
    }
  }
  
  static getModelFields() {
    // Return only fields relevant to game settings
    return Object.keys(new GameSetting().modelFields).map((key) => {
      const field = new GameSetting().modelFields[key];
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
    // File fields might not be necessary for settings, but included if needed
   
    return [
      {name: 'backgroundImg',  maxCount: 1 }, 
    ];
  }
  
  async uploadImagesToLinode(req, res, next) {
    try {
      if (req.files) {
        for (const key in req.files) {
          const file = req.files[key][0];
          const fileKey = `gameSettings/${Date.now()}-${file.originalname}`;
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
    return 'admin/gameSettings/template';
  }
}
