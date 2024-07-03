const { getDb } = require('../mongo');
const { ObjectId } = require('mongodb');

class Subscription {
  constructor({
    name,
    type,
    price,
    startDate = new Date(),
    endDate,
    mediumIcon,
    squareNonAuthBkgd,
    squareAuthBkgd,
    horizNonAuthBkgd,
    horizAuthBkgd,
    nonAuthTitle,
    nonAuthDescription,
    authTitle,
    authDescription,
    daysSubscribed,
    gemsType,
    gemsCt,
    items = [],
    vendors = [],
    gameTokens
  }) {
    this.name = name;
    this.type = type;
    this.price = price;
    this.startDate = startDate;
    this.endDate = endDate;
    this.mediumIcon = mediumIcon;
    this.squareNonAuthBkgd = squareNonAuthBkgd;
    this.squareAuthBkgd = squareAuthBkgd;
    this.horizNonAuthBkgd = horizNonAuthBkgd;
    this.horizAuthBkgd = horizAuthBkgd;
    this.nonAuthTitle = nonAuthTitle;
    this.nonAuthDescription = nonAuthDescription;
    this.authTitle = authTitle;
    this.authDescription = authDescription;
    this.daysSubscribed = daysSubscribed;
    this.gemsType = gemsType;
    this.gemsType = gemsType;
    this.items = items;
    this.vendors = vendors;
    this.gameTokens = gameTokens;
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
