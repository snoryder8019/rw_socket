const ModelHelper = require('../helpers/models');
const { upload, processImages } = require('../../multer/subscriptionSetup');
const { uploadToLinode } = require('../../aws_sdk/setup');

class Permission extends ModelHelper {
  constructor(permissionData) {
    super('permissions');
    this.modelFields = {      
      full:false,
      admin:false,
      users:false,
      games:false,
      videoLeads:false,
      videoProductions:false,
      bingoLeads:false,
      helps:false,
      chat:false,
      travels:false,
      destinations:false,
      excursions:false,
      clubs:false,
      blogs:false,
      webappSettings:false,
      sectionSettings:false,
      permissions:false,        
      notifications:false,   
      media:false,     
  
    };

    if (permissionData) {
      for (let key in this.modelFields) {
        if (permissionData[key] !== undefined) {
          this.modelFields[key].value = permissionData[key];
        }
      }
    }
  }

  static getModelFields() {
    return Object.keys(new Permission().modelFields).map(key => {
      const field = new Permission().modelFields[key];
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
          const fileKey = `permissions/${Date.now()}-${file.originalname}`;
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
    return 'admin/permissions/template';
  }
}

module.exports = Permission;
