const ModelHelper = require('../helpers/models');

class UserSetting extends ModelHelper {
  constructor(settingData) {
    super('userSettings');
    this.modelFields = {
      theme: { type: 'text', value: null },
      notifications: { type: 'boolean', value: true },
      language: { type: 'text', value: 'en' },
      privacy: { type: 'text', value: 'public' },
      timeZone: { type: 'text', value: null },
      emailFrequency: { type: 'text', value: 'daily' },
     
     
      recoveryPhone: { type: 'text', value: null },
      displayDensity: { type: 'text', value: 'compact' },
      // Add more fields as necessary...
    };

    if (settingData) {
      for (let key in this.modelFields) {
        if (settingData[key] !== undefined) {
          this.modelFields[key].value = settingData[key];
        }
      }
    }
  }

  static getModelFields() {
    return Object.keys(new UserSetting().modelFields).map(key => {
      const field = new UserSetting().modelFields[key];
      return { name: key, type: field.type };
    });
  }
}

module.exports = UserSetting;
