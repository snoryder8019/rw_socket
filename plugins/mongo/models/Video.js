// plugins/mongo/models/Video.js **NOTE GPT: DONOT REMOVE THIS LINE**
import ModelHelper from '../helpers/models.js';
import { upload, processImages } from '../../multer/subscriptionSetup.js'; // Multer for file handling
import { uploadToLinode, uploadVideoToLinode } from '../../aws_sdk/setup.js'; // Import Linode upload functions
import fs from 'fs'; // For file operations

const modelName = 'video';

export default class Video extends ModelHelper {
  constructor(videoData) {
    super(`${modelName}s`);
    this.modelFields = {
      name: { type: 'text', value: null },
      url: { type: 'text', value: null },
      alt: { type: 'text', value: null },
      directory: { type: 'text', value: null },
      thumbnailUrl: { type: 'text', value: null },
      settings: { type: 'array', value: [] },
      thumbnailFile: { type: 'file', value: null },
      videoFile: { type: 'file', value: null },
      blog: { type: 'boolean', value: false },
      travel: { type: 'boolean', value: false },
      help: { type: 'boolean', value: false },
      sectionReel: { type: 'boolean', value: false },
      club: { type: 'text', value: null },
      tags: { type: 'array', value: [] },
      premiumContent: { type: 'boolean', value: false },
    };

    if (videoData) {
      for (let key in this.modelFields) {
        if (videoData[key] !== undefined) {
          this.modelFields[key].value = videoData[key];
        }
      }
    }
  }

  static getModelFields() {
    return Object.keys(new Video().modelFields).map((key) => {
      const field = new Video().modelFields[key];
      return { name: key, type: field.type };
    });
  }

  middlewareForCreateRoute() {
    return [
      upload.fields(this.fileFields),
      processImages,
      this.handleFileUpload.bind(this),
    ];
  }

  middlewareForEditRoute() {
    return [
      upload.fields(this.fileFields),
      processImages,
      this.handleFileUpload.bind(this),
    ];
  }

  get fileFields() {
    return [
      { name: 'thumbnailFile', maxCount: 1 },
      { name: 'videoFile', maxCount: 1 },
    ];
  }

  async handleFileUpload(req, res, next) {
    try {
      if (req.file) {
        console.log('Handling file upload...');
        const fileKey = `${modelName}s/${Date.now()}-${req.file.originalname}`;
        const videoUrl = await uploadVideoToLinode(req.file.path, fileKey);
        console.log(`Video uploaded: ${videoUrl}`);
        req.body.url = videoUrl; // Save the uploaded video URL in the request body

        // Optionally, delete the file after uploading
        fs.unlinkSync(req.file.path);
        console.log('Video file deleted from local storage.');
      } else {
        console.log('No file uploaded, proceeding with metadata update only.');
      }

      // Merge req.body with existing video data if updating
      if (req.params.id) {
        const existingVideo = await this.getById(req.params.id);
        if (existingVideo) {
          req.body = { ...existingVideo, ...req.body }; // Merge existing data with new data
        } else {
          throw new Error(`Video with ID ${req.params.id} not found`);
        }
      }

      next();
    } catch (error) {
      console.error('Error in handleFileUpload middleware:', error);
      next(error);
    }
  }

  pathForGetRouteView() {
    return `admin/${modelName}s/template`;
  }
}
