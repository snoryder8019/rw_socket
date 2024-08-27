//routes/helpers/imagesArray.js **NOTE GPT: DONT REMOVE THIS LINE**
import { ObjectId } from 'mongodb';
import { uploadMultiple } from '../../plugins/multer/setup.js';
import { uploadToLinode } from '../../plugins/aws_sdk/setup.js'; // Adjust the path if necessary
import fs from 'fs'; // For file operations

export const imagesArray = (Model) => async (req, res, next) => {
  try {
    const { files, params: { id } } = req;
console.log(id)
    if (!files || files.length === 0) {
      return next(new Error('No files uploaded!'));
    }

    const uploadedImages = [];

    for (const file of files) {
      const fileKey = `images/${Date.now()}-${file.originalname}`;

      // Use file.buffer instead of file.path
      const imageUrl = await uploadToLinode(file.buffer, fileKey);
      uploadedImages.push(imageUrl);
    }

    // Check if the model instance with the given ID exists
    const existingInstance = await new Model().getById(new ObjectId(id));

    if (existingInstance) {
      // If the instance exists, push the new images to the existing imagesArray
      await new Model().pushById(
        id ,
        {  imagesArray: { $each: uploadedImages } }
      );
    } else {
      // If the instance does not exist, create a new one with imagesArray
      const newInstance = new Model({
        _id: id, // Ensure the ID is set
        imagesArray: uploadedImages,
        // Add other necessary fields here
      });
      await newInstance.save();
    }

    // Store the array in the request body for further processing if needed
    req.body.imagesArray = uploadedImages;

    console.log('Images uploaded and stored successfully:', uploadedImages);
    next();
  } catch (error) {
    console.error('Error in imagesArray:', error);
    next(error);
  }
};
