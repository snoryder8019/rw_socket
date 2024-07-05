const { getDb } = require('../mongo');
const { ObjectId } = require('mongodb');

class WebAppSettings {
  constructor({
    mainBannerDesktop,
    mainBannerCell,
    mainLogo,
    thumbnailLogo,
    signInIcon,
    dashboardIcon,
    chatIcon,
    borderRadiusBanner,
    borderRadiusMainContentBox,
    borderWidthStyleColor,
    boxShadowInsetWidthStyleColor,
    mainFont,
    mainFontColor,
    secondaryFont,
    secondaryFontColor,
    backgroundMainColor,
    chatGradient,
    googleLoginIcon,
    facebookLoginIcon,
    passwordLoginIcon,
    registerIcon,
    linkColor,
    inputBackground,
    inputBoxShadow,
    inputFontFamily,
    inputFontWeight,
    inputFontColor
  }) {
    this.mainBannerDesktop = mainBannerDesktop;
    this.mainBannerCell = mainBannerCell;
    this.mainLogo = mainLogo;
    this.thumbnailLogo = thumbnailLogo;
    this.signInIcon = signInIcon;
    this.dashboardIcon = dashboardIcon;
    this.chatIcon = chatIcon;
    this.borderRadiusBanner = borderRadiusBanner;
    this.borderRadiusMainContentBox = borderRadiusMainContentBox;
    this.borderWidthStyleColor = borderWidthStyleColor;
    this.boxShadowInsetWidthStyleColor = boxShadowInsetWidthStyleColor;
    this.mainFont = mainFont;
    this.mainFontColor = mainFontColor;
    this.secondaryFont = secondaryFont;
    this.secondaryFontColor = secondaryFontColor;
    this.backgroundMainColor = backgroundMainColor;
    this.chatGradient = chatGradient;
    this.googleLoginIcon = googleLoginIcon;
    this.facebookLoginIcon = facebookLoginIcon;
    this.passwordLoginIcon = passwordLoginIcon;
    this.registerIcon = registerIcon;
    this.linkColor = linkColor;
    this.inputBackground = inputBackground;
    this.inputBoxShadow = inputBoxShadow;
    this.inputFontFamily = inputFontFamily;
    this.inputFontWeight = inputFontWeight;
    this.inputFontColor = inputFontColor;
  }

  static async create(settings) {
    const db = getDb();
    const settingsCollection = db.collection('webappSettings');
    const result = await settingsCollection.insertOne(settings);
    return result;
  }

  static async getAll() {
    const db = getDb();
    const settingsCollection = db.collection('webappSettings');
    const settings = await settingsCollection.find().toArray();
    return settings;
  }

  static async getById(id) {
    const db = getDb();
    const settingsCollection = db.collection('webappSettings');
    const setting = await settingsCollection.findOne({ _id: new ObjectId(id) });
    return setting;
  }

  static async updateById(id, updatedSettings) {
    const db = getDb();
    const settingsCollection = db.collection('webappSettings');
    const result = await settingsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedSettings }
    );
    return result;
  }

  static async deleteById(id) {
    const db = getDb();
    const settingsCollection = db.collection('webappSettings');
    const result = await settingsCollection.deleteOne({ _id: new ObjectId(id) });
    return result;
  }
}

module.exports = WebAppSettings;
