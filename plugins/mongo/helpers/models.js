////plugins/mongo/helpers/models.js **GPT NOTE: DONT REMOVE THIS LINE IN EXAMPLES**

import { getDb } from '../mongo.js';
import { ObjectId } from 'mongodb';

export default class ModelHelper {
  constructor(collectionName) {
    this.collectionName = collectionName;
    this.modelFields = {}; // Child classes should define this
  }

  async create(document) {
    const db = getDb();
    const collection = db.collection(this.collectionName);
    const processedDocument = this.processData(document);
    const result = await collection.insertOne(processedDocument);
    if (result.insertedId) {
      return await collection.findOne({ _id: result.insertedId });
    } else {
      throw new Error('Failed to insert document');
    }
  }

  async getAll(arg) {
    const db = getDb();
    const collection = db.collection(this.collectionName);
    const documents = await collection.find(arg).toArray();
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
    const processedDocument = this.processData(updatedDocument);
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: processedDocument }
    );
    if (result.matchedCount === 0) {
      throw new Error('No document found with that ID');
    }
    return await collection.findOne({ _id: new ObjectId(id) });
  }
  async pushById(id, updateObject) {
    console.log(id)
    if (!ObjectId.isValid(id)) {
      throw new Error('Invalid ID format');
    }
    const db = getDb();
    const collection = db.collection(this.collectionName);
    // Use $push operation with the provided updateObject
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $push: updateObject }
    );

    if (result.matchedCount === 0) {
      throw new Error('No document found with that ID');
    }
    // Return the updated document
    return await collection.findOne({ _id: new ObjectId(id) });
  }
  async popById(id, imageUrl) {
    console.log(id);
    if (!ObjectId.isValid(id)) {
      throw new Error('Invalid ID format');
    }
    
    const db = getDb();
    const collection = db.collection(this.collectionName);
  
    // Use $pull operation to remove the image URL from imagesArray
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $pull: { imagesArray: imageUrl } } // Pull the image URL from the imagesArray
    );
  
    if (result.matchedCount === 0) {
      throw new Error('No document found with that ID');
    }
  
    // Return the updated document
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

  processData(data) {
    const processedData = {};
    for (const key in this.modelFields) {
      const field = this.modelFields[key];
      if (data[key] !== undefined) {
        processedData[key] = this.castValue(data[key], field.type);
      }
    }
    return processedData;
  }

  castValue(value, type) {
    switch (type) {
      case 'number':
        return Number(value);
      case 'boolean':
        return Boolean(value);
      case 'array':
        return Array.isArray(value) ? value : [value];
      case 'object':
        return typeof value === 'object' ? value : JSON.parse(value);
      case 'date':
        return new Date(value);
      case 'file':
        return value; // Assuming file handling is done separately
      default:
        return String(value);
    }
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

  pathForGetRouteView() {
    return '';
  }
}
