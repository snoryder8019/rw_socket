const ModelHelper = require('../helpers/models');

class Club extends ModelHelper {
  constructor(clubData) {
    super('clubs');
    if (clubData) {
      this.name = clubData.name;  
      this.authTitle = clubData.authTitle;
      this.nonAuthTitle = clubData.nonAuthTitle;
      this.authSubtitle = clubData.authSubtitle;
      this.nonAuthSubtitle = clubData.nonAuthSubtitle;
      this.authDescription = clubData.authDescription;
      this.nonAuthDescription = clubData.nonAuthDescription;
      this.price = clubData.price; 
      this.subLength = clubData.subLength;
      this.creationDate = clubData.creationDate;
      this.mediumIcon = clubData.mediumIcon;      
      this.squareNonAuthBkgd = clubData.squareNonAuthBkgd;
      this.squareAuthBkgd = clubData.squareAuthBkgd;
      this.horizNonAuthBkgd = clubData.horizNonAuthBkgd;
      this.horizAuthBkgd = clubData.horizAuthBkgd;
      this.entryUrl = clubData.entryUrl;
      this.entryText = clubData.entryText;
      this.updatedDate = clubData.updatedDate;
      this.status = clubData.status;
      this.visible = clubData.visible;
      this.tags = clubData.tags || [];
      this.links = clubData.links || [];
      this.blogs = clubData.blogs || [];
      this.vendors =clubData.vendors || [];
      this.members = clubData.members || [];
      
    }
  }
}

module.exports = Club;
