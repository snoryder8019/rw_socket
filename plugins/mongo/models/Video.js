import fs from 'fs';
import uploadToS3 from '../../aws_sdk/videoSetup.js';  // S3 upload for videos
import { uploadToLinode } from '../../aws_sdk/setup.js';  // Linode upload for images
import ModelHelper from '../helpers/models.js';
import { uploadVideo } from '../../multer/videoSetup.js';  // Multer config

const modelName = 'video';

export default class Video extends ModelHelper {
  constructor(videoData) {
    super(`${modelName}s`);
    this.modelFields = {
      name: { type: 'text', value: null },
      title: { type: 'text', value: null },
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

  // Middleware for creating new videos
  middlewareForCreateRoute() {
    return [
      uploadVideo.fields(this.fileFields),  // Handle file uploads
      this.uploadFilesToStorages.bind(this),  // Upload video to S3 and image to Linode
    ];
  }

  middlewareForEditRoute() {
    return [
      uploadVideo.fields(this.fileFields),  // Handle file uploads
      this.uploadFilesToStorages.bind(this),  // Upload video to S3 and image to Linode
    ];
  }

  // Define the file fields for Multer
  get fileFields() {
    return [
      { name: 'thumbnailFile', maxCount: 1 },  // Image uploaded to Linode
      { name: 'videoFile', maxCount: 1 },      // Video uploaded to S3
    ];
  }

  /**
   * Uploads video to S3 and thumbnail to Linode.
   */
  async uploadFilesToStorages(req, res, next) {
    try {
      if (req.files) {
        // Handle video file upload to S3
        if (req.files.videoFile) {
          const videoFile = req.files.videoFile[0];
          const videoKey = `${modelName}s/${Date.now()}-${videoFile.originalname}`;
          console.log(`Uploading video to S3 with key: ${videoKey}`);
          
          const videoUrl = await uploadToS3(videoFile.path, videoKey);  // Upload to S3
          req.body.url = videoUrl;  // Save video URL in request body

          // Optionally, delete the video file from local storage after upload
          await fs.promises.unlink(videoFile.path);
          console.log('Video file deleted from local storage.');
        }

        // Handle thumbnail file upload to Linode
        if (req.files.thumbnailFile) {
          const thumbnailFile = req.files.thumbnailFile[0];
          const thumbnailKey = `${modelName}s/${Date.now()}-${thumbnailFile.originalname}`;
          console.log(`Uploading thumbnail to Linode with key: ${thumbnailKey}`);
          
          const thumbnailUrl = await uploadToLinode(thumbnailFile.path, thumbnailKey);  // Upload to Linode
          req.body.thumbnailUrl = thumbnailUrl;  // Save thumbnail URL in request body

          // Optionally, delete the thumbnail file from local storage after upload
          await fs.promises.unlink(thumbnailFile.path);
          console.log('Thumbnail file deleted from local storage.');
        }
      }

      next();
    } catch (error) {
      console.error('Error in uploadFilesToStorages:', error);
      next(error);
    }
  }

  /**
   * Creates a new video in the database.
   */
  async uploadFilesToStorages(req, res, next) {
    try {
      if (req.files) {
        // Handle video file upload to S3
        if (req.files.videoFile) {
          const videoFile = req.files.videoFile[0];
          const videoKey = `${modelName}s/${Date.now()}-${videoFile.originalname}`;
          console.log(`Uploading video to S3 with key: ${videoKey}`);
  
          const videoUrl = await uploadToS3(videoFile.buffer, videoKey);  // Upload the buffer to S3
          req.body.url = videoUrl;  // Save video URL in request body
  
          console.log('Video uploaded successfully.');
        }
  
        // Handle thumbnail file upload to Linode
        if (req.files.thumbnailFile) {
          const thumbnailFile = req.files.thumbnailFile[0];
          const thumbnailKey = `${modelName}s/${Date.now()}-${thumbnailFile.originalname}`;
          console.log(`Uploading thumbnail to Linode with key: ${thumbnailKey}`);
  
          const thumbnailUrl = await uploadToLinode(thumbnailFile.buffer, thumbnailKey);  // Upload the buffer to Linode
          req.body.thumbnailUrl = thumbnailUrl;  // Save thumbnail URL in request body
  
          console.log('Thumbnail uploaded successfully.');
        }
      }
  
      next();
    } catch (error) {
      console.error('Error in uploadFilesToStorages:', error);
      next(error);
    }
  }
  

  // Define the path for rendering the view (template)
  pathForGetRouteView() {
    return `admin/${modelName}s/template`;
  }
}
