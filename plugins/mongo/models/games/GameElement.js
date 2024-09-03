import ModelHelper from '../../helpers/models.js';
import { upload, processImages } from '../../../multer/subscriptionSetup.js';
import { uploadToLinode } from '../../../aws_sdk/setup.js';

export default class GameElement extends ModelHelper {
  constructor(elementData) {
    super('gameElements');
    this.modelFields = {
      elementName: { type: 'string', value: '' }, // Name of the game element
      elementImage: { type: 'file', value: null }, // File property for the element image (e.g., PNG, JPG, GIF)
      spriteId: { type: 'string', value: '' }, // ID of the associated sprite
      //coords: { type: 'object', value: { x: 0, y: 0 } }, // Coordinates for the element on the game board
      elementValues: { type: 'string', value: null }, // Coordinates for the element on the game board
      elementFunction: { type: 'string', value: null }, // Coordinates for the element on the game board
      elementReacts: { type: 'string', value: null }, // Coordinates for the element on the game board
      elementSounds: { type: 'string', value: null }, // Coordinates for the element on the game board
      elementGame: { type: 'string', value: null }, // Coordinates for the element on the game board
      elementBackground: { type: 'boolean', value: false }, // Coordinates for the element on the game board
      elementMovable: { type: 'boolean', value: false }, // Coordinates for the element on the game board
      elementDropzone: { type: 'boolean', value: false }, // Coordinates for the element on the game board
      elementClassName: { type: 'boolean', value: false }, // Coordinates for the element on the game board
      elementInlineStyle: { type: 'boolean', value: false }, // Coordinates for the element on the game board
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
