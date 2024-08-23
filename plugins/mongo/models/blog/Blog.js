const ModelHelper = require('../helpers/models');
const { upload, processImages } = require('../../multer/subscriptionSetup');
const { uploadToLinode } = require('../../aws_sdk/setup');

class Blog extends ModelHelper {
  constructor(blogData) {
    super('blogs');
    this.modelFields = {
      title: { type: 'text', value: null },
      subtitle: { type: 'text', value: null },
      content: { type: 'textarea', value: null },
      author: { type: 'text', value: null },
      tags: { type: 'array', value: [] },
      status: { type: 'text', value: 'draft' },
      publishDate: { type: 'date', value: null },
      lastUpdated: { type: 'date', value: null },
      featuredImage: { type: 'file', value: null },
      coverImage: { type: 'file', value: null },
      categories: { type: 'array', value: [] },
      metaDescription: { type: 'text', value: null },
      metaKeywords: { type: 'array', value: [] },
      slug: { type: 'text', value: null },
      visibility: { type: 'text', value: 'public' },
      allowComments: { type: 'boolean', value: true },
      allowVotes: { type: 'boolean', value: true },
      views: { type: 'number', value: 0 },
      shares: { type: 'number', value: 0 },
      likes: { type: 'number', value: 0 },
      comments: { type: 'array', value: [] },
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

  static getModelFields() {
    return Object.keys(new Blog().modelFields).map(key => {
      const field = new Blog().modelFields[key];
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
      { name: 'featuredImage', maxCount: 1 },
      { name: 'coverImage', maxCount: 1 }
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
      console.error("Error in uploadImagesToLinode middleware:", error);
      next(error);
    }
  }

  pathForGetRouteView() {
    return 'admin/blogs/template';
  }
}

module.exports = Blog;
