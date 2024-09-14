import AWS from 'aws-sdk';

// Configure AWS SDK for S3
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
 * Uploads a buffer or file to AWS S3
 * @param {Buffer|string} input - A Buffer for in-memory file or string path for on-disk file.
 * @param {String} fileKey - Key under which to store the file in the bucket
 * @returns {Promise<String>} URL of the uploaded file
 */
export default async function uploadToS3(input, fileKey) {
  let fileContent;

  if (Buffer.isBuffer(input)) {
    fileContent = input;  // If it's a buffer, use it directly
  } else {
    throw new Error('The input must be a Buffer');
  }

  const params = {
    Bucket: process.env.LINODE_BUCKET,
    Key: fileKey,
    Body: fileContent,
    ACL: 'public-read',
    ContentType: 'video/mp4',  // Adjust the content type as needed
  };

  try {
    const uploadResult = await s3.upload(params).promise();
    return uploadResult.Location;  // Return the S3 URL
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw error;
  }
}
