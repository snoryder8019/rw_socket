import mongoose from 'mongoose';
import {config} from '../../config/config.js'
export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      'mongodb://' +
        config.DB_URL +
        '/' +
        config.DB_NAME +
        '?retryWrites=true&w=majority'
    );
    console.log(`mongo connected:` + conn.connection.host);
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};
