const ModelHelper = require('../helpers/models');
const { upload, processImages } = require('../../multer/subscriptionSetup');
const { uploadToLinode } = require('../../aws_sdk/setup');

class SectionSettings extends ModelHelper {
  constructor(sectionSettingsData) {
    super('sectionSettings');
    this.modelFields = {
      name:{type:'text',value:null},
    }
    if(clubData){
      for (let key in this.modelFields){
        this.if(clubData[key] !== undefined){
          this.modelFields[key].value = sectionSettingsData; 
        }
      }
    }
  }
    // this.visible = visible;
    // this.auth_view = auth_view;
    // this.backgroundImg = backgroundImg;
    // this.secondaryBackgroundImg = secondaryBackgroundImg;
    // this.title = title;
    // this.subtitle = subtitle;
    // this.description = description;
    // this.entryButton = entryButton;

    static getModelFields() {
      return Object.keys(new SectionSettings().modelFields).map(key => {
        const field = new SectionSettings().modelFields[key];
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
      //  { name: 'mediumIcon', maxCount: 1 },
       
      ];
    }
  
    async uploadImagesToLinode(req, res, next) {
      try {
        if (req.files) {
          for (const key in req.files) {
            const file = req.files[key][0];
            const fileKey = `sectionSettings/${Date.now()}-${file.originalname}`;
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
      return 'admin/sectionSettings/template';
    }
  }
  
  module.exports = SectionSettings;
  