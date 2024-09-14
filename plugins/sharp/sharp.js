import sharp from 'sharp';
import path from 'path';
export const resizeAndCropImage = async (
  input,
  outputDirectory,
  filename,
  type,
  options = {}
) => {
  const outputPath = path.join(outputDirectory, filename);
  var sharpInstance = Buffer.isBuffer(input)
    ? sharp(input)
    : sharp(path.join(outputDirectory, input));

  // Pre-process for "general" type to dynamically resize based on image dimensions
  if (type === 'general') {
    const metadata = await sharpInstance.metadata();
    if (metadata.width > 800 || metadata.height > 600) {
      sharpInstance = sharpInstance.resize({
        width: 800,
        height: 600,
        fit: 'inside',
        withoutEnlargement: true,
      });
    }
  }

  switch (type) {
    case 'profileBackground':
      sharpInstance.resize(1920, 1080).toFormat('jpeg', { quality: 80 });
      break;
    case 'thumbnail':
      sharpInstance.resize(150, 150).toFormat('jpeg', { quality: 80 });
      break;
    case 'avatar':
      sharpInstance.resize(500, 500).toFormat('jpeg', { quality: 80 });
      break;
    case 'general':
      sharpInstance.toFormat('jpeg', { quality: 80 });
      break;
    case 'raw':
      sharpInstance = applyCustomSharpOptions(sharpInstance, options);
      break;
    // New type: poster
    case 'poster':
      sharpInstance.resize(1080, 1920).toFormat('jpeg', { quality: 85 });
      break;
    // New type: banner
    case 'banner':
      sharpInstance.resize(1600, 400).toFormat('jpeg', { quality: 85 });
      break;
    default:
      sharpInstance.toFormat('jpeg', { quality: 80 });
  }

  // Finalize the file
  await sharpInstance.toFile(outputPath);

  return outputPath;
};

function applyCustomSharpOptions(sharpInstance, options) {
  // Apply custom Sharp transformations based on provided options for "raw"
  Object.keys(options).forEach((key) => {
    const value = options[key];
    if (typeof sharpInstance[key] === 'function') {
      sharpInstance = sharpInstance[key](...[].concat(value));
    }
  });
  return sharpInstance;
}
