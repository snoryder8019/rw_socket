import ModelHelper from '../helpers/models.js';
import { upload, processImages } from '../../multer/subscriptionSetup.js';
import { uploadToLinode } from '../../aws_sdk/setup.js';

export default class ChatMessage extends ModelHelper {
  constructor(chatMessageData) {
    super('chat_messages_meta');
    this.modelFields = {
      roomId: { type: 'text', value: null },
      textOnly: { type: 'boolean', value: true },
      avatarType: { type: 'text', value: null },
      chatType: { type: 'text', value: null },
      chatStyle: { type: 'text', value: null },
      avatarStyle: { type: 'text', value: null },
      flagged: { type: 'text', value: null },
      likes: { type: 'number', value: 0 },
      message: { type: 'text', value: null },
      messageDate: { type: 'text', value: null },
      responses: { type: 'array', value: [] },
      likedBy: { type: 'array', value: [] },
      replies: { type: 'array', value: [] },
      sharedBy: { type: 'array', value: [] },
      user: { type: 'text', value: null },
      visible: { type: 'boolean', value: true },
      reviewed: { type: 'boolean', value: false },
      reviewedBy: { type: 'text', value: null },
      thumbnailUrl: { type: 'file', value: null },
      image: { type: 'file', value: null },
      messageThumb: { type: 'file', value: null },

      link: { type: 'text', value: null },
    };
  }

  static getModelFields() {
    return Object.keys(new ChatMessage().modelFields).map((key) => {
      const field = new ChatMessage().modelFields[key];
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
      { name: 'messageThumb', maxCount: 1 },
      { name: 'thumbnailUrl', maxCount: 1 },
      { name: 'image', maxCount: 1 },
    ];
  }

  async uploadImagesToLinode(req, res, next) {
    try {
      if (req.files) {
        for (const key in req.files) {
          const file = req.files[key][0];
          const fileKey = `chatMessages/${Date.now()}-${file.originalname}`;
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
    return 'admin/chatMessages/template';
  }
}
