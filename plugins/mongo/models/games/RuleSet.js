import ModelHelper from '../../helpers/models.js';
import { upload, processImages } from '../../../multer/subscriptionSetup.js';
import { uploadToLinode } from '../../../aws_sdk/setup.js';

export default class RuleSet extends ModelHelper {
  constructor(ruleData) {
    super('ruleSets');
    this.modelFields = {
      ruleName: { type: 'string', value: '' }, // Name of the rule set
      description: { type: 'string', value: '' }, // Description of the rule set
      ruleFile: { type: 'file', value: null }, // Optional file for rule set details (e.g., PDF, DOCX)
      rules: { type: 'array', value: [] }, // Optional file for rule set details (e.g., PDF, DOCX)
      createdDate: { type: 'date', value: new Date() }, // Date the rule set was created
    };

    if (ruleData) {
      for (let key in this.modelFields) {
        if (ruleData[key] !== undefined) {
          this.modelFields[key].value = ruleData[key];
        }
      }
    }
  }

  static getModelFields() {
    return Object.keys(new RuleSet().modelFields).map((key) => {
      const field = new RuleSet().modelFields[key];
      return { name: key, type: field.type };
    });
  }

  middlewareForCreateRoute() {
    return [
      upload.fields(this.fileFields),
      processImages,
      this.uploadFilesToLinode.bind(this),
    ];
  }

  middlewareForEditRoute() {
    return [
      upload.fields(this.fileFields),
      processImages,
      this.uploadFilesToLinode.bind(this),
    ];
  }

  get fileFields() {
    return [
      { name: 'ruleFile', maxCount: 1 }, // Allow uploading one file related to the rule set
    ];
  }

  async uploadFilesToLinode(req, res, next) {
    try {
      if (req.files && req.files.ruleFile) {
        const file = req.files.ruleFile[0];
        const fileKey = `ruleSets/${Date.now()}-${file.originalname}`;
        const url = await uploadToLinode(file.path, fileKey);
        req.body.ruleFile = url; // Save the URL in the request body
      }
      next();
    } catch (error) {
      console.error('Error in uploadFilesToLinode middleware:', error);
      next(error);
    }
  }

  pathForGetRouteView() {
    return 'admin/ruleSets/template';
  }
}
