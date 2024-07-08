const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SectionSettingsSchema = new Schema({
  visible: {
    type: Boolean,
    required: true,
    default: true
  },
  auth_view: {
    type: Boolean,
    required: true,
    default: false
  },
  backgroundImg: {
    type: String,
    required: false
  },
  secondaryBackgroundImg: {
    type: String,
    required: false
  },
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    required: false
  },
  description: {
    type: String,
    required: false
  },
  entryButton: {
    text: { type: String, required: false },
    url: { type: String, required: false }
  }
}, {
  timestamps: true
});

const SectionSettings = mongoose.model('SectionSettings', SectionSettingsSchema);
module.exports = SectionSettings;
