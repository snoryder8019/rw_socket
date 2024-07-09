const ModelHelper = require('../helpers/models');

class Subscription extends ModelHelper {
  constructor(subscriptionData) {
    super('subscriptions');
    if (subscriptionData) {
      this.name = subscriptionData.name;
      this.type = subscriptionData.type;
      this.price = subscriptionData.price;
      this.startDate = subscriptionData.startDate || new Date();
      this.endDate = subscriptionData.endDate;
      this.mediumIcon = subscriptionData.mediumIcon;
      this.squareNonAuthBkgd = subscriptionData.squareNonAuthBkgd;
      this.squareAuthBkgd = subscriptionData.squareAuthBkgd;
      this.horizNonAuthBkgd = subscriptionData.horizNonAuthBkgd;
      this.horizAuthBkgd = subscriptionData.horizAuthBkgd;
      this.nonAuthTitle = subscriptionData.nonAuthTitle;
      this.nonAuthDescription = subscriptionData.nonAuthDescription;
      this.authTitle = subscriptionData.authTitle;
      this.authDescription = subscriptionData.authDescription;
      this.daysSubscribed = subscriptionData.daysSubscribed;
      this.gemsType = subscriptionData.gemsType;
      this.gemsCt = subscriptionData.gemsCt;
      this.items = subscriptionData.items || [];
      this.vendors = subscriptionData.vendors || [];
      this.gameTokens = subscriptionData.gameTokens;
    }
  }
}

module.exports = new Subscription();
