import ModelHelper from '../helpers/models.js';
import { upload, processImages } from '../../multer/subscriptionSetup.js';
import { uploadToLinode } from '../../aws_sdk/setup.js';

const modelName = 'sectionSetting';

export default class SectionSetting extends ModelHelper {
  constructor(sectionSettingData) {
    super(`${modelName}s`);
    this.modelFields = {
      name: { type: 'text', value: null },
      modelName: { type: 'text', value: null },
      order: { type: 'number', value: null },
      title: { type: 'text', value: null },
      subTitle: { type: 'text', value: null },
      animation: { type: 'text', value: 'none' },
      buttonDivStyle: { type: 'text', value: 'content' },
      buttonStyle: { type: 'text', value: 'collapsable' },
      linkStyle: { type: 'text', value: 'linkTable' },
      style: { type: 'text', value: 'auth_view_true' },
      innerStyle: { type: 'text', value: 'index-container' },
      description: { type: 'text', value: null },
      entryUrl: { type: 'text', value: null },
      entryText: { type: 'text', value: null },
      visible: { type: 'boolean', value: false },
      authView: { type: 'boolean', value: false },
      nonAuthView: { type: 'boolean', value: false },
      premium: { type: 'text', value: null },
      nonAuthTitle: { type: 'text', value: null },
      nonAuthSubTitle: { type: 'text', value: null },
      nonAuthdescripton: { type: 'text', value: null },
      backgroundImg: { type: 'file', value: null },
      secondaryBackgroundImg: { type: 'file', value: null },
      mediumIcon: { type: 'file', value: null },
      links: { type: 'array', value: [] },
      imagesArray: { type: 'array', value: [] },
      tags: { type: 'array', value: [] },
    };
    if (sectionSettingData) {
      for (let key in this.modelFields) {
        if (sectionSettingData[key] !== undefined) {
          this.modelFields[key].value = sectionSettingData[key];
        }
      }
    }
  }

  static getModelFields() {
    return Object.keys(new SectionSetting().modelFields).map((key) => {
      const field = new SectionSetting().modelFields[key];
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
      //  { name: 'mediumIcon', maxCount: 1 },
      { name: 'backgroundImg', maxCount: 1 },
      { name: 'secondaryBackgroundImage', maxCount: 1 },
      { name: 'mediumIcon', maxCount: 1 },
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
      console.error('Error in uploadImagesToLinode middleware:', error);
      next(error);
    }
  }

  pathForGetRouteView() {
    return `admin/${modelName}s/template`;
  }
}
