// /plugins/aws_sdk/setup.js
const AWS = require('aws-sdk');
const fs = require('fs');

// Configure AWS SDK for Linode Object Storage
const s3 = new AWS.S3({
    accessKeyId: process.env.LINODE_ACCESS,
    secretAccessKey: process.env.LINODE_SEC,
    endpoint: process.env.LINODE_URL,
    s3ForcePathStyle: true,
    signatureVersion: 'v4',
    region: process.env.LINODE_REGION,
    httpOptions: {
      connectTimeout: 10000, // 10 seconds
      timeout: 30000 // 30 seconds
    }
  });
  

/**
 * Uploads a file to Linode Object Storage
 * @param {String} filePath Path to the file on the local system
 * @param {String} fileKey Key under which to store the file in the bucket
 * @returns {Promise<String>} URL of the uploaded file
 */
const uploadToLinode = async (filePath, fileKey) => {
  const fileContent = fs.readFileSync(filePath);

  const params = {
    Bucket: process.env.LINODE_BUCKET,
    Key: fileKey,
    Body: fileContent,
    ACL: 'public-read', // Adjust according to your privacy requirements
  };

  try {
    const uploadResult = await s3.upload(params).promise();
    return uploadResult.Location; // URL of the uploaded file
  } catch (error) {
    console.error("Error uploading to Linode Object Storage:", error);
    throw error; // Rethrow to handle it in the calling function
  }
};

module.exports = {
  uploadToLinode,
};
