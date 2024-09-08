import ModelHelper from '../../helpers/models.js';
import { upload, processImages } from '../../../multer/subscriptionSetup.js';
import { uploadToLinode } from '../../../aws_sdk/setup.js';
import Game from './Game.js';
import Sprite from './GameSprite.js';

export default class GameElement extends ModelHelper {
  constructor(elementData) {
    super('gameElements');

    // Define model fields for GameElement
    this.modelFields = {
      name: { type: 'string', value: '' },
      game:{type: 'string',value:null},
      isBkgd: { type: 'boolean', value: false },
      image: { type: 'file', value: null },
      isSprite: { type: 'boolean', value: false },
      /*dataType:'number' ensures input type to the array*/
      spriteCoords: { type: 'array', value: [], dataType:'number' },
      sourceCoords: { type: 'array', value: [], dataType:'number' },
      startCoords: { type: 'array', value: [], dataType:'number'},
      function: { type: 'string', value: null },
      reacts: { type: 'string', value: null },
      sounds: { type: 'string', value: null },
      movable: { type: 'boolean', value: false },
      dropzone: { type: 'boolean', value: false },
      dropzoneClassName:{type:'text', value: false},
      className: { type: 'text', value: null },
      inlineStyle: { type: 'text', value: false },
      itemScore:{type:'number',value:null},
      customField1: { type: 'custom', value: [] }, // Custom Game select
      customField2: { type: 'custom', value: [] }, // Custom Sprite select
    };

    if (elementData) {
      for (let key in this.modelFields) {
        if (elementData[key] !== undefined) {
          this.modelFields[key].value = elementData[key];
        }
      }
    }
  }

  // Populate options for customField1 and customField2 from external data
  async populateCustomFields() {
    const games = await new Game().getAll(); // Fetch games from Game collection
    const sprites = await new Sprite().getAll(); // Fetch sprites from Sprite collection

    // Populate customField1 with games
    this.modelFields.customField1.value = games.map(game => ({
      value: game._id,
      label: game.name,
    }));

    // Populate customField2 with sprites
    this.modelFields.customField2.value = sprites.map(sprite => ({
      value: sprite._id,
      label: sprite.name,
    }));
  }

  // Static method to get model fields for form generation
  // This remains as your original version!
  static getModelFields() {
    return Object.keys(new GameElement().modelFields).map((key) => {
      const field = new GameElement().modelFields[key];
      return { name: key, type: field.type };
    });
  }

  // Middleware for handling create routes (file upload)
  middlewareForCreateRoute() {
    return [
      upload.fields(this.fileFields),
      processImages,
      this.uploadImagesToLinode.bind(this),
    ];
  }

  // Middleware for handling edit routes (file upload)
  middlewareForEditRoute() {
    return [
      upload.fields(this.fileFields),
      processImages,
      this.uploadImagesToLinode.bind(this),
    ];
  }

  // Define file fields to be uploaded
  get fileFields() {
    return [{ name: 'image', maxCount: 1 }];
  }

  // Middleware to handle uploading images to Linode
  async uploadImagesToLinode(req, res, next) {
    try {
      if (req.files && req.files.image) {
        const file = req.files.image[0];
        const fileKey = `gameElements/${Date.now()}-${file.originalname}`;
        const url = await uploadToLinode(file.path, fileKey);
        req.body.image = url; // Save the URL in the request body
      }
      next();
    } catch (error) {
      console.error('Error in uploadImagesToLinode middleware:', error);
      next(error);
    }
  }

  // Path for rendering the view
  pathForGetRouteView() {
    return 'admin/gameElements/template';
  }
}
