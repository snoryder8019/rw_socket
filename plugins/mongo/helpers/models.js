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
    if (result.insertedId) {
      return await collection.findOne({ _id: result.insertedId });
    } else {
      throw new Error('Failed to insert document');
    }
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
    if (result.matchedCount === 0) {
      throw new Error('No document found with that ID');
    }
    return await collection.findOne({ _id: new ObjectId(id) });
  }

  async deleteById(id) {
    if (!ObjectId.isValid(id)) {
      throw new Error('Invalid ID format');
    }
    const db = getDb();
    const collection = db.collection(this.collectionName);
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      throw new Error('No document found with that ID');
    }
    return result;
  }

  // CRUD routes may require middleware to run when the route is called. Implement these methods in the child class to provide middleware for each route.
  middlewareForCreateRoute() {
    return [];
  }

  middlewareForEditRoute() {
    return [];
  }

  middlewareForDeleteRoute() {
    return [];
  }

  middlewareForGetRoute() {
    return [];
  }
}

module.exports = ModelHelper;
