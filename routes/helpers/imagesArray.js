//routes/helpers/imagesArray.js **NOTE GPT: DONT REMOVE THIS LINE**
import { ObjectId } from 'mongodb';
import { uploadMultiple } from '../../plugins/multer/setup.js';
import { uploadToLinode } from '../../plugins/aws_sdk/setup.js'; // Adjust the path if necessary
import fs from 'fs'; // For file operations

// Middleware to handle image uploads and updates for a given model
export const imagesArray = (Model) => async (req, res, next) => {
  try {
    const { files, params: { id } } = req;

    console.log('Received ID:', id);

    if (!files || files.length === 0) {
      return next(new Error('No files uploaded!'));
    }

    const uploadedImages = [];

    // Process and upload each file
    for (const file of files) {
      const fileKey = `images/${Date.now()}-${file.originalname}`;
      const imageUrl = await uploadToLinode(file.buffer, fileKey);
      uploadedImages.push(imageUrl);
    }

    // Check if the model instance with the given ID exists
    const existingInstance = await new Model().getById(new ObjectId(id));

    if (existingInstance) {
      // If the instance exists, push the new images to the existing imagesArray
      await new Model().pushById(
        id,
        { imagesArray: { $each: uploadedImages } }
      );
    } else {
      // If the instance does not exist, create a new one with imagesArray
      const newInstance = new Model({
        _id: new ObjectId(id), // Convert ID to ObjectId if it's not already
        imagesArray: uploadedImages,
        // Add other necessary fields here if required
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

// Functions to get and update the images array
export const getImagesArray = (Model) => async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    const instance = await new Model().getById(new ObjectId(id));
    if (!instance) {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.status(200).render('forms/getImagesArray',{ imagesArray: instance.imagesArray});
  } catch (error) {
    console.error('Error fetching images array:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Function to remove an image from the images array
export const popImagesArray = (Model) => async (req, res) => {
  try {
    const { id, url } = req.params; // Get the document ID from request parameters
    

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    // Use $pull to remove the image URL from imagesArray
    const result = await new Model().findByIdAndUpdate(
      new ObjectId(id),
      { $pull: { imagesArray: url } }, // Remove image URL from the imagesArray
      { new: true } // Return the updated document
    );

    if (!result) {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.status(200).json({ message: 'Image removed successfully', imagesArray: result.imagesArray });
  } catch (error) {
    console.error('Error removing image from images array:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


export const updateImagesArray = (Model) => async (req, res) => {
  try {
    const { id } = req.params;
    const { imagesArray } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    const updatedInstance = await new Model().findByIdAndUpdate(
      new ObjectId(id),
      { $set: { imagesArray } },
      { new: true }
    );

    if (!updatedInstance) {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.status(200).json({ message: 'Images array updated successfully', imagesArray: updatedInstance.imagesArray });
  } catch (error) {
    console.error('Error updating images array:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
