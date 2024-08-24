// plugins/mongo/models/Video.js **NOTE GPT: DONOT REMOVE THIS LINE**
const ModelHelper = require('../helpers/models');
const { uploadVideoToLinode } = require('../../aws_sdk/setup'); // Use uploadVideoToLinode for video uploads
const modelName = 'video';
const fs = require('fs'); // For file operations

class Video extends ModelHelper {
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
    return Object.keys(new Video().modelFields).map(key => {
      const field = new Video().modelFields[key];
      return { name: key, type: field.type };
    });
  }

  get fileFields() {
    return [
      { name: 'thumbnailFile', maxCount: 1 },
    ];
  }

  async createVid(file) {
    try {
      console.log(`createVid ran!`);

      if (!file || !file.path) {
        throw new Error('Invalid file object or file path');
      }

      // Generate a unique key for the video to store in Linode
      const fileKey = `${modelName}s/${Date.now()}-${file.originalname}`;

      // Upload the video to Linode and get the URL
      const videoUrl = await uploadVideoToLinode(file.path, fileKey);
      console.log(`Video uploaded to Linode: ${videoUrl}`);

      // Prepare the video metadata for the database
      const videoData = {
        name: file.originalname,
        url: videoUrl,
        alt: this.modelFields.alt.value,
        directory: this.modelFields.directory.value,
        thumbnailUrl: this.modelFields.thumbnailUrl.value,
        settings: this.modelFields.settings.value,
        blog: this.modelFields.blog.value,
        travel: this.modelFields.travel.value,
        help: this.modelFields.help.value,
        sectionReel: this.modelFields.sectionReel.value,
        club: this.modelFields.club.value,
        tags: this.modelFields.tags.value,
        premiumContent: this.modelFields.premiumContent.value,
      };

      // Save the metadata to the database
      const savedVideo = await super.create(videoData);  // Use super.create() for database insertion
      console.log(`Video metadata saved to database: ${savedVideo}`);

      // Optionally delete the file from the local system after uploading
      fs.unlinkSync(file.path);
      console.log('Video file deleted from local storage.');

      return savedVideo;
    } catch (error) {
      console.error("Error in Video.createVid:", error);
      throw error;
    }
  }
  // New method to update a video entry
  async updateVid(id, file, updatedFields) {
    try {
      console.log(`updateVid ran!`);
      
      let videoUrl;

      // Check if a new video file is provided for upload
      if (file && file.path) {
        // Generate a unique key for the new video to store in Linode
        const fileKey = `${modelName}s/${Date.now()}-${file.originalname}`;

        // Upload the new video to Linode and get the URL
        videoUrl = await uploadVideoToLinode(file.path, fileKey);
        console.log(`New video uploaded to Linode: ${videoUrl}`);
      }

      // Prepare the updated video metadata for the database
      const videoData = {
        ...updatedFields, // Include any fields that were updated from the form
        url: videoUrl || this.modelFields.url.value, // If a new video was uploaded, use its URL; otherwise, keep the existing URL
      };

      // Update the video metadata in the database
      const updatedVideo = await super.updateById(id, videoData);
      console.log(`Video metadata updated in the database: ${updatedVideo}`);

      // Optionally delete the new file from the local system after uploading
      if (file && file.path) {
        fs.unlinkSync(file.path);
        console.log('New video file deleted from local storage.');
      }

      return updatedVideo;
    } catch (error) {
      console.error("Error in Video.updateVid:", error);
      throw error;
    }
  }
  async uploadVideoToLinode(req, res, next) {
    try {
      const videoFile = req.file;

      if (videoFile) {
        console.log('Uploading video file...');
        const fileKey = `${modelName}s/${Date.now()}-${videoFile.originalname}`;
        const videoUrl = await uploadVideoToLinode(videoFile.path, fileKey);
        console.log(`Video uploaded: ${videoUrl}`);
        req.body.url = videoUrl; // Save the video URL in the request body
      }
      next();
    } catch (error) {
      console.error("Error in uploadVideoToLinode middleware:", error);
      next(error);
    }
  }

  pathForGetRouteView() {
    return `admin/${modelName}s/template`;
  }
}

module.exports = Video;
