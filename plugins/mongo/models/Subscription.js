const { getDb } = require('../mongo');
const { ObjectId } = require('mongodb');

class Subscription {
  constructor({ name, type, price, startDate = new Date(), endDate }) {
    this.name = name;
    this.type = type;
    this.price = price;
    this.startDate = startDate;
    this.endDate = endDate;
  }

  static async create(subscription) {
    const db = getDb();
    const subscriptionsCollection = db.collection('subscriptions');
    const result = await subscriptionsCollection.insertOne(subscription);
    return result;
  }

  static async getAll() {
    const db = getDb();
    const subscriptionsCollection = db.collection('subscriptions');
    const subscriptions = await subscriptionsCollection.find().toArray();
    return subscriptions;
  }

  static async getById(id) {
    const db = getDb();
    const subscriptionsCollection = db.collection('subscriptions');
    const subscription = await subscriptionsCollection.findOne({ _id: new ObjectId(id) });
    return subscription;
  }

  static async updateById(id, updatedSubscription) {
    const db = getDb();
    const subscriptionsCollection = db.collection('subscriptions');
    const result = await subscriptionsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedSubscription }
    );
    return result;
  }

  static async deleteById(id) {
    const db = getDb();
    const subscriptionsCollection = db.collection('subscriptions');
    const result = await subscriptionsCollection.deleteOne({ _id: new ObjectId(id) });
    return result;
  }
}

module.exports = Subscription;
