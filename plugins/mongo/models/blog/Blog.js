import ModelHelper from '../../helpers/models.js';
import { upload, processImages } from '../../../multer/subscriptionSetup.js';
import { uploadToLinode } from '../../../aws_sdk/setup.js';
import Vote from './Vote.js'

export default class Blog extends ModelHelper {
  constructor(blogData) {
    super('blogs');
    this.modelFields = {
      name: { type: 'text', value: null },
      order:{type:'number',value:null},
      title: { type: 'text', value: null },
      subtitle: { type: 'text', value: null },
      content: { type: 'textarea', value: null },
      author: { type: 'text', value: null },
      tags: { type: 'array', value: [] },
      status: { type: 'text', value: 'draft' },
      publishDate: { type: 'date', value: null },
      lastUpdated: { type: 'date', value: null },
      featureImage: { type: 'file', value: null },
      horizBkgrd: { type: 'file', value: null },
      mediumIcon: { type: 'file', value: null },
      backgroundImg: { type: 'file', value: null },
      categories: { type: 'array', value: [] },
      metaDescription: { type: 'text', value: null },
      metaKeywords: { type: 'array', value: [] },
      slug: { type: 'text', value: null },
      custom1: { type: 'custom1', value: null },
      visibility: { type: 'text', value: 'public' },
      allowComments: { type: 'boolean', value: true },
      help: { type: 'boolean', value: false },
      views: { type: 'number', value: 0 },
      shares: { type: 'number', value: 0 },
      likes: { type: 'number', value: 0 },
      comments: { type: 'array', value: [] },
      vote:{type:'dropdown',value:['none']}
      // Add more fields as necessary...
    };

    if (blogData) {
      for (let key in this.modelFields) {
        if (blogData[key] !== undefined) {
          this.modelFields[key].value = blogData[key];
        }
      }
    }
  }

  
  async getModelOptions(modelList = {}) {
    const options = {};

    for (const [fieldName, Model] of Object.entries(modelList)) {
      try {
        const modelInstance = new Model();
        const data = await modelInstance.getAll(); // Assuming every model has a getAll method
        options[fieldName] = data.map(item => ({ label: item.name || item.title || item.question, value: item._id }));
      } catch (error) {
        console.error(`Error fetching options for ${fieldName}:`, error);
        options[fieldName] = []; // Fallback to empty array in case of error
      }
    }

    return options;
  }
  static getModelFields() {
    return Object.keys(new Blog().modelFields).map((key) => {
      const field = new Blog().modelFields[key];
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
      { name: 'horizBkgrd', maxCount: 1 },
      { name: 'featureImage', maxCount: 1 },
      { name: 'backgroundImg', maxCount: 1 },
      { name: 'mediumIcon', maxCount: 1 },
    ];
  }

  async uploadImagesToLinode(req, res, next) {
    try {
      if (req.files) {
        for (const key in req.files) {
          const file = req.files[key][0];
          const fileKey = `blogs/${Date.now()}-${file.originalname}`;
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
    return 'admin/blogs/template';
  }
}
