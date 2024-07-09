const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const VideoSchema = new Schema({
  name: { type: String, required: true },
  url: { type: String, required: true },
  thumbnail: { type: String, required: true },
}, {
  timestamps: true
});

const Video = mongoose.model('Video', VideoSchema);
module.exports = Video;
