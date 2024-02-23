const sharp = require('sharp');
const path = require('path');


const resizeAndCropImage = async (originalFilePath, outputDirectory, filename) => {
  const outputPath = path.join(outputDirectory, filename);
  
  await sharp(originalFilePath)
    .resize(500, 500) // Set the desired size
    //.rotate(90) // Rotate by 90 degrees
    .toFormat('jpeg', { quality: 80 }) // Convert to jpeg and reduce file size
    .toFile(outputPath);

  return outputPath;
};

module.exports = {
  resizeAndCropImage,
};
