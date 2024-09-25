import ModelHelper from "../../helpers/models.js";
export default class Notify extends ModelHelper {
  constructor(notifyData) {
    super(`${modelName}s`);
    this.modelFields = {
      notificationId: { type: 'text', value: null },    // Reference to the notification
      recipientId: { type: 'text', value: null },       // ID of the recipient
      recipientIds: { type: 'array', value: [] },       // List of recipient IDs
      recipientType: { type: 'text', value: null },     // Type of recipient (e.g., user, group)
      status: { type: 'text', value: 'pending' },       // Status of the notification (e.g., sent, seen, failed)
      interval: { type: 'text', value: 'once' },        // Interval for the notification (e.g., once, daily)
      sentAt: { type: 'date', value: null },            // Date and time when the notification was sent
      usersSeen: { type: 'array', value: [] },          // Users who have seen the notification
      actionBy: { type: 'array', value: [] },           // Users who took action on the notification
      actionHookBy: { type: 'array', value: [] },       // Users who triggered action hooks
      unsubscribedBy: { type: 'array', value: [] },     // Users who unsubscribed from the notification
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
      // processImages,
      // this.uploadImagesToLinode.bind(this),
    ];
  }

  middlewareForEditRoute() {
    return [
      // upload.fields(this.fileFields),
      // processImages,
      // this.uploadImagesToLinode.bind(this),
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

  // Add new functionality: Unsubscribe recipient
  async unsubscribeRecipient(notificationId, recipientId) {
    const db = getDb();
    const collection = db.collection(this.collectionName);
    const updateResult = await collection.updateOne(
      { notificationId, recipientId },
      { $addToSet: { unsubscribedBy: recipientId } }  // Add the recipient to unsubscribed list
    );
    return updateResult;
  }

  // Add new functionality: Schedule notifications
  async scheduleNotification(notificationData, interval) {
    const db = getDb();
    const collection = db.collection(this.collectionName);

    // Add logic for scheduling the notification
    const notification = { ...notificationData, interval };

    try {
      const result = await collection.insertOne(notification);
      return result;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      throw new Error('Notification could not be scheduled');
    }
  }

  pathForGetRouteView() {
    return `admin/${modelName}s/template`;
  }
}
