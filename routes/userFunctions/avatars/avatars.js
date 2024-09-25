// routes/adminFunctions/avatars/avatars.js
import express from 'express';
import Avatar from '../../../plugins/mongo/models/Avatar.js';
import generateFormFields from '../../../plugins/helpers/formHelper.js';
import { buildRoutes } from '../../helpers/routeBuilder.js';
import { uploadMultiple } from '../../../plugins/multer/setup.js';
import { imagesArray } from '../../../routes/helpers/imagesArray.js';
import { rotateAndResizeAvatar } from '../../../plugins/sharp/imageProcessor.js';
import { fileURLToPath } from 'url';
import path from 'path';

// Get the directory name equivalent to __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = express.Router();

// Route to render the form to add a new avatar
router.get('/renderAddForm', (req, res) => {
  try {
    const model = Avatar.getModelFields();
    const formFields = generateFormFields(model);
    console.log('renderAddForm');

    res.render('forms/generalForm', {
      title: 'Add New Avatar',
      action: '/avatars/create',
      formFields: formFields,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

// Route to render the form to edit an existing avatar
router.get('/renderEditForm/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const avatar = await new Avatar().getById(id);
    if (!avatar) {
      return res.status(404).send({ error: 'Avatar not found' });
    }

    const model = Avatar.getModelFields();
    const formFields = generateFormFields(model, avatar);

    const enhancedFormFields = formFields.map(field => {
      if (Array.isArray(field.value)) {
        return {
          ...field,
          type: 'array',
          value: field.value,
        };
      } else if (typeof field.value === 'object' && field.value !== null) {
        return {
          ...field,
          type: 'object',
          value: Object.entries(field.value).map(([key, val]) => ({
            key,
            val,
          })),
        };
      } else if (typeof field.value === 'boolean') {
        return {
          ...field,
          type: 'boolean',
          value: field.value,
        };
      }
      return field;
    });

    res.render('forms/generalEditForm', {
      title: `Edit Avatar`,
      action: `avatars/update/${id}`,
      routeSub: `avatars`,
      method: 'post',
      formFields: enhancedFormFields,
      data: avatar,
      script: `<script>
          document.addEventListener('DOMContentLoaded', function () {
            console.log('Page-specific JS loaded for Edit Form');
          });
        </script>`
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});
router.get('/returnUserAvatar', async (req,res)=>{
  try{
    const user = req.user;
    const userId = user._id.toString();
    const avatars = await new Avatar().getAll({"userId":userId})
res.render('./userDash/avatars/template',{avatars:avatars,user:user})
  }
  catch(error){console.error(error)}
})
router.post('/assign/:id', async (req, res) => {
  try {
    const update = req.body;
    const user = req.user;
    const userId = user._id.toString();
    const avatarId = req.params.id;

    // Fetch all avatars for the user
    const avatars = await new Avatar().getAll({ "userId": userId });

    // Use for...of to handle async/await properly
    for (const avatar of avatars) {
      await new Avatar().updateById(avatar._id, { "assigned": false });
    }

    // Update the specific avatar to be assigned
    await new Avatar().updateById(avatarId, update);

    // Fetch the updated avatars again
    const updatedAvatars = await new Avatar().getAll({ "userId": userId });

    // Render the updated avatars
    res.render('./userDash/avatars/template', { avatars: updatedAvatars, user });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'An error occurred while assigning the avatar.' });
  }
});
router.post('/rotate/:deg', async (req, res) => {
  try {
    const rotation = req.params.deg;
    const { avatarUrl, avatarId } = req.body;
    const user = req.user; // Assuming the user is attached to the request object
    const userId = user._id.toString();
    const avatarIdStr = avatarId.toString();
    const avatarUrly = avatarUrl.toString();

    console.log(`Received request to rotate avatar at: ${avatarUrly} with rotation angle: ${rotation}`);

    // Use the existing file key to overwrite the current avatar
    const fileKey = `avatars/${path.basename(avatarUrly)}`; // Keep the same file name and path

    // Call the rotate and resize function, overwriting the existing file
    const updatedAvatarUrl = await rotateAndResizeAvatar(avatarUrly, rotation, fileKey, null); // Overwrite, no need to delete

    console.log(`Avatar successfully processed and updated at the same URL: ${updatedAvatarUrl}`);

    // Update the avatar record in the database (same URL)
    const updateRes = await new Avatar().updateById(avatarIdStr, { avatarUrl: updatedAvatarUrl });

    console.log(`Avatar record updated in the database with the same URL: ${updatedAvatarUrl}`);
    console.log(updateRes);

    // Retrieve updated avatar list
    const avatars = await new Avatar().getAll({ userId: userId });

    // Render the template with the updated avatar data
    res.render('./userDash/avatars/template', {
      user, // Pass the user object to the template
      avatars // Pass the updated avatar list to the template
    });
  } catch (error) {
    console.error('Error rotating and updating avatar:', error);
    res.status(500).send({ error: 'Failed to rotate and update avatar' });
  }
});




/////////////////
router.get('/section', async (req, res) => {
  try {
    const data = await new Avatar().getAll();
    res.render('./layouts/section', {
      title: 'Section View',
      data: data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

router.post('/:id/upload-images', uploadMultiple, imagesArray(Avatar), async (req, res) => {
  try {
    res.status(200).json({ message: 'Avatar images uploaded and updated successfully', images: req.body.imagesArray });
  } catch (error) {
    console.error('Error processing images for Avatar:', error);
    res.status(500).send('Internal Server Error');
  }
});

buildRoutes(new Avatar(), router);

export default router;
