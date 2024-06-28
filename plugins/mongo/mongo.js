const { MongoClient } = require('mongodb');
const config = require('../../config/config');
const env = require('dotenv').config();

const uri =   "mongodb://"+config.DB_URL+"/"+config.DB_NAME+"?retryWrites=true&w=majority"

let _db;

const connect = async () => {
  if (!_db) {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    _db = client.db(config.DB_NAME);
    console.log("Connected to MongoDB");
  }
  return _db;
};

const getDb = () => {
  if (!_db) {
    throw new Error('Database not initialized');
  }
  return _db;
};

module.exports = {
  connect,
  getDb
};
