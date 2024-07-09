const { getDb } = require('../mongo');
const { ObjectId } = require('mongodb');

class ModelHelper {
  constructor(collectionName) {
    this.collectionName = collectionName;
  }

  async create(document) {
    const db = getDb();
    const collection = db.collection(this.collectionName);
    const result = await collection.insertOne(document);
    return result;
  }

  async getAll() {
    const db = getDb();
    const collection = db.collection(this.collectionName);
    const documents = await collection.find().toArray();
    return documents;
  }

  async getById(id) {
    if (!ObjectId.isValid(id)) {
      throw new Error('Invalid ID format');
    }
    const db = getDb();
    const collection = db.collection(this.collectionName);
    const document = await collection.findOne({ _id: new ObjectId(id) });
    return document;
  }

  async updateById(id, updatedDocument) {
    if (!ObjectId.isValid(id)) {
      throw new Error('Invalid ID format');
    }
    const db = getDb();
    const collection = db.collection(this.collectionName);
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedDocument }
    );
    return result;
  }

  async deleteById(id) {
    if (!ObjectId.isValid(id)) {
      throw new Error('Invalid ID format');
    }
    const db = getDb();
    const collection = db.collection(this.collectionName);
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    return result;
  }
}

module.exports = ModelHelper;
