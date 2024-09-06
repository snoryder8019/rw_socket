import ModelHelper from '../../helpers/models.js';
import { upload, processImages } from '../../../multer/subscriptionSetup.js';
import { uploadToLinode } from '../../../aws_sdk/setup.js';
const elOptions = []
export default class GameElement extends ModelHelper {
  constructor(elementData) {
    super('gameElements');
    this.modelFields = {
      name: { type: 'string', value: '' }, // Name of the game element
      image: { type: 'file', value: null }, // File property for the element image (e.g., PNG, JPG, GIF)
      spriteId: { type: 'string', value: '' }, // ID of the associated sprite
      spriteCoords: { type: 'array', value: [] }, // Array Values as COORD ARGS X:Y:W:H: in px it will be stamped by a cropper from Sprite()
      //coords: { type: 'object', value: { x: 0, y: 0 } }, // Coordinates for the element on the game board
      startCoords: { type: 'string', value: null }, // Start Coords    
      function: { type: 'string', value: null }, // call function
      reacts: { type: 'string', value: null }, // 
      sounds: { type: 'string', value: null }, // id for sound pasted 
      isBkgd: { type: 'boolean', value: false }, //mark as true to use as the background image of the games template
      movable: { type: 'boolean', value: false }, // Coordinates for the element on the game board
      dropzone: { type: 'boolean', value: false }, // Coordinates for the element on the game board
      className: { type:'text', value: null }, // class to ref the SCSS
      inlineStyle: { type: 'text', value: false }, // inline to the CSS it should overide
    };

    if (elementData) {
      for (let key in this.modelFields) {
        if (elementData[key] !== undefined) {
          this.modelFields[key].value = elementData[key];
        }
      }
    }
  }

  static getModelFields() {
    return Object.keys(new GameElement().modelFields).map((key) => {
      const field = new GameElement().modelFields[key];
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
      { name: 'elementImage', maxCount: 1 }, // Allow uploading one element image file
    ];
  }

  async uploadImagesToLinode(req, res, next) {
    try {
      if (req.files && req.files.elementImage) {
        const file = req.files.elementImage[0];
        const fileKey = `gameElements/${Date.now()}-${file.originalname}`;
        const url = await uploadToLinode(file.path, fileKey);
        req.body.elementImage = url; // Save the URL in the request body
      }
      next();
    } catch (error) {
      console.error('Error in uploadImagesToLinode middleware:', error);
      next(error);
    }
  }

  pathForGetRouteView() {
    return 'admin/gameElements/template';
  }
}
