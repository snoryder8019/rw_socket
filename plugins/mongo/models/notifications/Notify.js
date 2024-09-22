import ModelHelper from '../../helpers/models.js';
import { upload, processImages } from '../../../multer/subscriptionSetup.js';
import { uploadToLinode } from '../../../aws_sdk/setup.js';
import { getDb } from '../../../../plugins/mongo/mongo.js';

const modelName = 'notify';

export default class Notify extends ModelHelper {
  constructor(notifyData) {
    super(`${modelName}s`);
    this.modelFields = {
      notificationId: { type: 'text', value: null },    // Reference to the notification
      recipientId: { type: 'text', value: null },       // ID of the recipient
      recipientIds: { type: 'array', value: [] },       // List of recipient IDs
      recipientType: { type: 'text', value: null },     // Type of recipient (e.g., user, group)
      status: { type: 'text', value: 'pending' },       // Status of the notification (e.g., sent, seen, failed)
      interval: { type: 'text', value: 'once' },       // Status of the notification (e.g., sent, seen, failed)
      sentAt: { type: 'date', value: null },            // Date and time when the notification was sent
      usersSeen: { type: 'array', value: [] },
      actionBy: { type: 'array', value: [] },
      actionHookBy: { type: 'array', value: [] },
      unsubscribedBy: { type: 'array', value: [] },       // Date and time when the notification was seen
      actionTaken: { type: 'boolean', value: false },   // Whether an action was taken on the notification
      actionTakenAt: { type: 'date', value: null },     // Date and time when the action was taken
      actionType: { type: 'text', value: null },        // Type of action taken (e.g., clicked, dismissed)
      metadata: { type: 'array', value: [] },           // Additional metadata related to the notification
    };

    if (notifyData) {
      for (let key in this.modelFields) {
        if (notifyData[key] !== undefined) {
          this.modelFields[key].value = notifyData[key];
        }
      }
    }
  }

  static getModelFields() {
    return Object.keys(new Notify().modelFields).map(key => {
      const field = new Notify().modelFields[key];
      return { name: key, type: field.type };
    });
  }
  middlewareForCreateRoute() {
    return [
     // upload.fields(this.fileFields),
    //  processImages,
    //  this.uploadImagesToLinode.bind(this),
    ];
  }

  middlewareForEditRoute() {
    return [
    //  upload.fields(this.fileFields),
    //  processImages,
    //  this.uploadImagesToLinode.bind(this),
    ];
  }

  async stampAsSent(notificationId, recipientId) {
    const db = getDb();
    const collection = db.collection(this.collectionName);
    const updateResult = await collection.updateOne(
      { notificationId, recipientId },
      { $set: { status: 'sent', sentAt: new Date() } }
    );
    return updateResult;
  }

  async stampAsSeen(notificationId, recipientId) {
    const db = getDb();
    const collection = db.collection(this.collectionName);
    const updateResult = await collection.updateOne(
      { notificationId, recipientId },
      { $set: { status: 'seen', seenAt: new Date() } }
    );
    return updateResult;
  }

  async recordAction(notificationId, recipientId, actionType) {
    const db = getDb();
    const collection = db.collection(this.collectionName);
    const updateResult = await collection.updateOne(
      { notificationId, recipientId },
      {
        $set: { actionTaken: true, actionTakenAt: new Date(), actionType },
      }
    );
    return updateResult;
  }

  // Send notification method
  async send(notification) {
    const db = getDb();
    const collection = db.collection(this.collectionName);
    
 

    try {
      const result = await collection.insertOne(notification);
      return result;
    } catch (error) {
      console.error('Error sending notification:', error);
      throw new Error('Notification could not be sent');
    }
  }

  pathForGetRouteView() {
    return `admin/${modelName}s/template`;
  }
}
