import ModelHelper from '../helpers/models.js';
import { upload, processImages } from '../../multer/subscriptionSetup.js';
import { uploadToLinode } from '../../aws_sdk/setup.js';

export default class ChatRoom extends ModelHelper {
  constructor(chatRoomData) {
    super('chat_rooms_meta');
    this.modelFields = {
      roomName: { type: 'text', value: null },
      roomMeassage: { type: 'text', value: null },
      active: { type: 'boolean', value: false },
      createdBy: { type: 'text', value: false },
      createdOn: { type: 'date', value: new Date() },
      lastMessage: { type: 'text', value: null },
      lastMessageDate: { type: 'date', value: new Date() },
      clubId: { type: 'text', value: null },
      gameSessionId: { type: 'text', value: null },
      clubOnly: { type: 'boolean', value: false },
      moderatedBy: { type: 'textarea', value: null },
      mainChat: { type: 'boolean', value: false },
      tags: { type: 'array', value: [] },
      testMode: { type: 'boolean', value: false },
    };

    if (chatRoomData) {
      for (let key in this.modelFields) {
        if (chatRoomData[key] !== undefined) {
          this.modelFields[key].value = chatRoomData[key];
        }
      }
    }
  }

  static getModelFields() {
    return Object.keys(new ChatRoom().modelFields).map((key) => {
      const field = new ChatRoom().modelFields[key];
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
      { name: 'mediumIcon', maxCount: 1 },
      { name: 'backgroundImg', maxCount: 1 },
      { name: 'horizBkgd', maxCount: 1 },
    ];
  }

  async uploadImagesToLinode(req, res, next) {
    try {
      if (req.files) {
        for (const key in req.files) {
          const file = req.files[key][0];
          const fileKey = `chatRooms/${Date.now()}-${file.originalname}`;
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
    return 'admin/chats/template';
  }
}
