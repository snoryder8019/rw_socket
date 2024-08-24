import ModelHelper from '../helpers/models.js';
import { upload, processImages } from '../../multer/subscriptionSetup.js';
import { uploadToLinode } from '../../aws_sdk/setup.js';

const modelName = 'webappSetting';

export default class WebappSetting extends ModelHelper {
  constructor(webappSettingData) {
    super(`${modelName}s`);
    this.modelFields = {
      mainBannerDesktop: { type: 'file', value: null },
      mainBannerCell: { type: 'file', value: null },
      mainLogo: { type: 'file', value: null },
      thumbnailLogo: { type: 'file', value: null },
      signInIcon: { type: 'file', value: null },
      dashboardIcon: { type: 'file', value: null },
      chatIcon: { type: 'file', value: null },
      borderRadiusBanner: { type: 'text', value: null },
      borderRadiusMainContentBox: { type: 'text', value: null },
      borderWidthStyleColor: { type: 'text', value: null },
      boxShadowInsetWidthStyleColor: { type: 'text', value: null },
      mainFont: { type: 'text', value: null },
      mainFontColor: { type: 'text', value: null },
      secondaryFont: { type: 'text', value: null },
      secondaryFontColor: { type: 'text', value: null },
      backgroundMainColor: { type: 'text', value: null },
      chatGradient: { type: 'text', value: null },
      googleLoginIcon: { type: 'file', value: null },
      facebookLoginIcon: { type: 'file', value: null },
      passwordLoginIcon: { type: 'file', value: null },
      registerIcon: { type: 'file', value: null },
      linkColor: { type: 'text', value: null },
      inputBackground: { type: 'text', value: null },
      inputBoxShadow: { type: 'text', value: null },
      inputFontFamily: { type: 'text', value: null },
      inputFontWeight: { type: 'text', value: null },
      inputFontColor: { type: 'text', value: null },
    };
    if (webappSettingData) {
      for (let key in this.modelFields) {
        if (webappSettingData[key] !== undefined) {
          this.modelFields[key].value = webappSettingData[key];
        }
      }
    }
  }

  static getModelFields() {
    return Object.keys(new WebappSetting().modelFields).map((key) => {
      const field = new WebappSetting().modelFields[key];
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
      { name: 'mainBannerDesktop', maxCount: 1 },
      { name: 'mainBannerCell', maxCount: 1 },
      { name: 'mainLogo', maxCount: 1 },
      { name: 'thumbnailLogo', maxCount: 1 },
      { name: 'signInIcon', maxCount: 1 },
      { name: 'dashboardIcon', maxCount: 1 },
      { name: 'chatIcon', maxCount: 1 },
      { name: 'googleLoginIcon', maxCount: 1 },
      { name: 'facebookLoginIcon', maxCount: 1 },
      { name: 'passwordLoginIcon', maxCount: 1 },
      { name: 'registerIcon', maxCount: 1 },
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
