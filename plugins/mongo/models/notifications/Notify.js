const ModelHelper = require('../../helpers/models');
const { upload, processImages } = require('../../../multer/subscriptionSetup');
const { uploadToLinode } = require('../../../aws_sdk/setup');
const modelName = 'notify';

class Notify extends ModelHelper {
  constructor(notifyData) {
    super(`${modelName}s`);
    this.modelFields = {
      notificationId: { type: 'text', value: null },    // Reference to the notification
      recipientId: { type: 'text', value: null },       // ID of the recipient
      recipientType: { type: 'text', value: null },     // Type of recipient (e.g., user, group)
      status: { type: 'text', value: 'pending' },       // Status of the notification (e.g., sent, seen, failed)
      sentAt: { type: 'date', value: null },            // Date and time when the notification was sent
      seenAt: { type: 'date', value: null },            // Date and time when the notification was seen
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

  pathForGetRouteView() {
    return `admin/${modelName}s/template`;
  }
}

module.exports = Notify;
