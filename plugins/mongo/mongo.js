const { MongoClient } = require('mongodb');
const config = require('../../config/config');
const env = require('dotenv').config();

let _db;

const connect = async () => {
  if (!_db) {
    const client = new MongoClient(config.db_uri);
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
