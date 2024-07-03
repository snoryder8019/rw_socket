const { getDb } = require('../mongo');
const { ObjectId } = require('mongodb');

class Club {
  constructor({ 
    name, description = '',
     members = [],
     vendors =[] ,
     blogs =[] ,
      createdDate = new Date(), 
      updatedDate = new Date(),
     status = 'active',
}) {
    this.name = name;
    this.description = description;
    this.members = members;
    this.vendors =vendors;
    this.blogs = blogs;
    this.createdDate = createdDate;
    this.updatedDate = updatedDate;
    this.status = status;
  }

  static async create(club) {
    const db = getDb();
    const clubsCollection = db.collection('clubs');
    const result = await clubsCollection.insertOne(club);
    return result;
  }

  static async getAll() {
    const db = getDb();
    const clubsCollection = db.collection('clubs');
    const clubs = await clubsCollection.find().toArray();
    return clubs;
  }

  static async getById(id) {
    const db = getDb();
    const clubsCollection = db.collection('clubs');
    const club = await clubsCollection.findOne({ _id: new ObjectId(id) });
    return club;
  }

  static async updateById(id, updatedClub) {
    const db = getDb();
    const clubsCollection = db.collection('clubs');
    updatedClub.updatedDate = new Date(); // Update the updatedDate
    const result = await clubsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedClub }
    );
    return result;
  }

  static async deleteById(id) {
    const db = getDb();
    const clubsCollection = db.collection('clubs');
    const result = await clubsCollection.deleteOne({ _id: new ObjectId(id) });
    return result;
  }
}

module.exports = Club;
