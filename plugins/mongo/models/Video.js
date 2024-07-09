const ModelHelper = require('../helpers/models');

class Video extends ModelHelper {
  constructor() {
    super('videos');
  }
}

module.exports = new Video();
