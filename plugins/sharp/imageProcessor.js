import axios from 'axios';
import sharp from 'sharp';
import { uploadToLinode } from '../aws_sdk/setup.js'; // Adjust path as needed
import path from 'path';
import fs from 'fs/promises'; // For saving the file temporarily

// Temporary directory for storing files
const TEMP_DIR = '/tmp';

/**
 * Downloads an image from a given URL and stores it in the local temporary directory.
 * @param {String} url - The URL of the image to download.
 * @param {String} filename - The name of the file to store locally.
 * @returns {String} The local path to the downloaded image.
 */
const downloadImage = async (url, filename) => {
  const localPath = path.join(TEMP_DIR, filename);
  const response = await axios({
    url,
    method: 'GET',
    responseType: 'arraybuffer', // Fetches the data as a buffer
  });

  console.log(`Downloading image from: ${url}`);
  // Save the downloaded file to local disk
  await fs.writeFile(localPath, response.data);
  console.log(`Image saved locally at: ${localPath}`);
  return localPath;
};

/**
 * Rotates and resizes the image using Sharp, then uploads it back to Linode Object Storage.
 * @param {String} avatarUrl - The URL of the avatar to download.
 * @param {Number} rotationAngle - The angle to rotate the image.
 * @param {String} fileKey - The key to use when uploading the file back to Linode (overwrite if same).
 * @returns {Promise<String>} The URL of the processed and uploaded image.
 */
export const rotateAndResizeAvatar = async (avatarUrl, rotationAngle, newFileKey, oldFileKey) => {
  const filename = path.basename(avatarUrl); // Extracts the filename from the URL
  const localPath = await downloadImage(avatarUrl, filename); // Download the image

  const rotatedFilename = `rotated_${filename}`;
  const rotatedLocalPath = path.join('/tmp', rotatedFilename);

  // Process the image (resize to 500x500 and rotate by the specified angle)
  console.log(`Processing image: resizing to 500x500 and rotating by ${rotationAngle} degrees`);
  await sharp(localPath)
    .resize(500, 500) // Resize to 500x500
    .rotate(Number(rotationAngle)) // Rotate the image by the given angle
    .toFile(rotatedLocalPath); // Save the processed image locally
  console.log(`Processed image saved locally at: ${rotatedLocalPath}`);

  // Upload the processed image to Linode Object Storage, overwriting the original
  console.log(`Uploading new image to Linode Object Storage with key: ${newFileKey}`);
  const uploadedUrl = await uploadToLinode(rotatedLocalPath, newFileKey, oldFileKey);
  console.log(`New image uploaded to Linode Object Storage at: ${uploadedUrl}`);

  // Clean up local files
  console.log(`Cleaning up local files: ${localPath} and ${rotatedLocalPath}`);
  await fs.unlink(localPath); // Remove the original downloaded file
  await fs.unlink(rotatedLocalPath); // Remove the processed file

  return uploadedUrl;
};

