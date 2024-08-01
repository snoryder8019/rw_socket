const ModelHelper = require('../helpers/models');
const { upload, processImages } = require('../../multer/subscriptionSetup');
const { uploadToLinode } = require('../../aws_sdk/setup');

class SectionSetting extends ModelHelper {
  constructor(sectionSettingData) {
    super('sectionSettings');
    this.modelFields = {
      name:{type:'text',value:null},
      title:{type:'text',value:null},
      subTitle:{type:'text',value:null},
      descripton:{type:'text',value:null},
      entryUrl:{type:'text',value:null},
      entryText:{type:'text',value:null},
      visible:{type:'boolean',value:null},
      authView:{type:'boolean',value:null},
      nonAuthOnly:{type:'boolean',value:null},
      nonAuthTitle:{type:'text',value:null},
      nonAuthSubTitle:{type:'text',value:null},
      nonAuthdescripton:{type:'text',value:null},
      backgroundImg:{type:'file',value:null},
      secondaryBackgroundImg:{type:'file',value:null},
      mediumIcon:{type:'file',value:null},
      links:{type:'text',value:null},
      tags:{type:'text',value:null},
      
    };
    if(sectionSettingData){
      for (let key in this.modelFields){
        if(sectionSettingData[key] !== undefined) {
          this.modelFields[key].value = sectionSettingData[key]; 
        }
      }
    }
  }

    static getModelFields() {
      return Object.keys(new SectionSetting().modelFields).map(key => {
        const field = new SectionSetting().modelFields[key];
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
       {name:'backgroundImg',maxCount:1},
       {name:'secondaryBackgroundImage',maxCount:1},
       {name:'mediumIcon', maxCount:1}
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
  
  module.exports = SectionSetting;
  