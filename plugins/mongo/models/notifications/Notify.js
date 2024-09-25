import { getDb } from '../../../mongo/mongo.js';
import { ObjectId } from 'mongodb';
import ModelHelper from '../../helpers/models.js';

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
      interval: { type: 'text', value: 'once' },  
      replies: { type: 'array', value: [] },
      sentAt: { type: 'date', value: null },            // Date and time when the notification was sent
      usersSeen: { type: 'array', value: [] },
      actionBy: { type: 'array', value: [] },
      actionHookBy: { type: 'array', value: [] },
      unsubscribedBy: { type: 'array', value: [] },     // Date and time when the notification was seen
      actionTaken: { type: 'boolean', value: false },   // Whether an action was taken on the notification
      actionTakenAt: { type: 'date', value: null },     // Date and time when the action was taken
      actionType: { type: 'text', value: null },        // Type of action taken (e.g., clicked, dismissed)
      metadata: { type: 'array', value: [] },           // Additional metadata related to the notification
      notification: { type: 'object', value: {} },      // Holds Notification fields
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

  // Method to stamp the notification data inside the Notify object
  async send(notificationData, notification) {
    const db = getDb();
    const collection = db.collection(this.collectionName);

    // Stamping Notification fields into Notify object
    const notifyObject = {
      ...notificationData, // This will include recipient info, status, etc.
      notification: {      // Include extracted Notification fields
        type: notification.type,
        sendGroup: notification.sendGroup,
        scheduledOutgoing: notification.scheduledOutgoing,
        autoSchedule: notification.autoSchedule,
        actionTrigger: notification.actionTrigger,
        draft: notification.draft,
        created: notification.created,
        backgroundImg: notification.backgroundImg,
        iconImage: notification.iconImage,
        content: notification.content,
        subtitle: notification.subtitle,
        title: notification.title,
        links: notification.links,
        active: notification.active,
        recycle: notification.recycle,
      },
      sentAt: new Date(),
    };

    try {
      const result = await collection.insertOne(notifyObject);
      return result;
    } catch (error) {
      console.error('Error sending notification:', error);
      throw new Error('Notification could not be sent');
    }
  }

  // Other existing methods for stamping as sent, seen, etc.
}
