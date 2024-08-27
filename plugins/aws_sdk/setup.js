import AWS from 'aws-sdk';
import fs from 'fs';

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
    timeout: 30000, // 30 seconds
  },
});

/**
 * Uploads a file or buffer to Linode Object Storage
 * @param {Buffer|string} input - A Buffer if the file is in memory or a string path if the file is on disk.
 * @param {String} fileKey Key under which to store the file in the bucket
 * @returns {Promise<String>} URL of the uploaded file
 */
export const uploadToLinode = async (input, fileKey) => {
  let fileContent;

  if (Buffer.isBuffer(input)) {
    // If input is a buffer, use it directly
    fileContent = input;
  } else if (typeof input === 'string') {
    // If input is a string, assume it's a file path and read the file
    fileContent = fs.readFileSync(input);
  } else {
    throw new TypeError('Input must be a Buffer or a file path string.');
  }

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
    console.error('Error uploading to Linode Object Storage:', error);
    throw error; // Rethrow to handle it in the calling function
  }
};
