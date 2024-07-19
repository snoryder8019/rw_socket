const ModelHelper = require('../helpers/models');
const { upload, processImages } = require('../../multer/subscriptionSetup');
const { uploadToLinode } = require('../../aws_sdk/setup');

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

  // Right now this model is not using the route builder, but if it was this would be what the function would need to look like in order for it to work.
  middlewareForEditRoute() {
    return [upload.fields(this.fileFields), processImages, uploadToLinode];
  }

  middlewareForCreateRoute() {
    return [upload.fields(this.fileFields), processImages, this.uploadImagesToLinode];
  }

  fileFields = [
    { name: 'mediumIcon', maxCount: 1 },
    { name: 'squareNonAuthBkgd', maxCount: 1 },
    { name: 'squareAuthBkgd', maxCount: 1 },
    { name: 'horizNonAuthBkgd', maxCount: 1 },
    { name: 'horizAuthBkgd', maxCount: 1 }
  ];

  async uploadImagesToLinode(req, res, next) {
    try {
      if (req.files) {
        for (const key in req.files) {
          const file = req.files[key][0];
          const fileKey = `clubs/${Date.now()}-${file.originalname}`;
          const url = await uploadToLinode(file.path, fileKey);
          req.body[key] = url; // Save the URL in the request body
        }
      }
      next();
    } catch (error) {
      console.error("Error in uploadImagesToLinode middleware:", error);
      next(error);
    }
  };
}

module.exports = Club;
