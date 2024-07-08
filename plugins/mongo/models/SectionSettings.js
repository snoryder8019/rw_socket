const { getDb } = require('../mongo');
const { ObjectId } = require('mongodb');

class SectionSettings {
  constructor({
    visible,
    auth_view,
    backgroundImg,
    secondaryBackgroundImg,
    title,
    subtitle,
    description,
    entryButton
  }) {
    this.visible = visible;
    this.auth_view = auth_view;
    this.backgroundImg = backgroundImg;
    this.secondaryBackgroundImg = secondaryBackgroundImg;
    this.title = title;
    this.subtitle = subtitle;
    this.description = description;
    this.entryButton = entryButton;
  }

  static async create(settings) {
    const db = getDb();
    const settingsCollection = db.collection('sectionSettings');
    const result = await settingsCollection.insertOne(settings);
    return result;
  }

  static async getAll() {
    const db = getDb();
    const settingsCollection = db.collection('sectionSettings');
    const settings = await settingsCollection.find().toArray();
    return settings;
  }

  static async getById(id) {
    const db = getDb();
    const settingsCollection = db.collection('sectionSettings');
    const setting = await settingsCollection.findOne({ _id: new ObjectId(id) });
    return setting;
  }

  static async updateById(id, updatedSettings) {
    const db = getDb();
    const settingsCollection = db.collection('sectionSettings');
    const result = await settingsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedSettings }
    );
    return result;
  }

  static async deleteById(id) {
    const db = getDb();
    const settingsCollection = db.collection('sectionSettings');
    const result = await settingsCollection.deleteOne({ _id: new ObjectId(id) });
    return result;
  }
}

module.exports = SectionSettings;
