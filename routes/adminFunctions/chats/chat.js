
const express = require('express');
const ChatRoom = require('../../../plugins/mongo/models/ChatRoom');
const { generateFormFields } = require('../../../plugins/helpers/formHelper');
const buildRoutes = require('../../helpers/routeBuilder');
const Vendor = require('../../../plugins/mongo/models/Vendor');
const router = express.Router();
const modelName = "chatRoom";
// Route to render the form to add a new chatRoom
router.get('/renderAddForm', (req, res) => {
  try {
    const model = ChatRoom.getModelFields();
    const formFields = generateFormFields(model);
    console.log('renderAddForm');

    res.render('forms/generalForm', {
      title: 'Add New ChatRoom',
      action: '/chats/create',
      formFields: formFields
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

// Route to render the form to edit an existing chatRoom
router.get('/renderEditForm/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const chatRoom = await new ChatRoom().getById(id);
    if (!chatRoom) {
      return res.status(404).send({ error: 'ChatRoom not found' });
    }
    const model = ChatRoom.getModelFields();
    const formFields = generateFormFields(model, chatRoom); // Generate form fields as an array

    res.render('forms/generalEditForm', {
      title: 'Edit ChatRoom',
      action: `chats/update/${id}`,
      routeSub: 'chats',
      method: 'post',
      formFields: formFields,
      data: chatRoom
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});
/////////////////
router.get('/section', async (req, res) => {
  try {
    const data = await new ChatRoom().getAll();
    res.render('./layouts/section', {
      title: 'Section View',
      data: data
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

buildRoutes(new ChatRoom(), router);

module.exports = router;

// const express = require('express');
// const path = require('path');
// const fs = require('fs').promises;
// const ChatMessage = require('../../../plugins/mongo/models/ChatMessage'); // Adjust the path to your models
// const Clubs = require('../../../plugins/mongo/models/Club'); // Adjust the path to your models
// const ChatRoom = require('../../../plugins/mongo/models/ChatRoom'); // Adjust the path to your models

// const router = express.Router();



// router.get('/load', async (req, res) => {
//     try {
//         console.log('/load clubs');
//         const chats = await new ChatMessage().getAll();
//         const chatRooms = await new ChatRoom().getAll();
//         const clubs = await new Clubs().getAll();
//         console.log(chats);

//       res.render('admin/chat/chatSupport',{
//         chats:chats,
//         chatRooms:chatRooms,
//         clubs:clubs
//       })
//     } catch (error) {
//         console.error(error);
//         res.status(500).send('Internal Server Error');
//     }
// });

// router.post('/createChatRoom', async (req, res) => {
//     try {
//         const chatRoomData = req.body;
//         await new ChatRoom().create(chatRoomData);
        
//         req.flash('success','created chatroom')
//         res.send('Chat room created successfully');
//     } catch (error) {
//         req.flash('error',error)
//         console.error('Failed to create chat room:', error);
//         res.status(500).send('Failed to create chat room: ' + error.message);
//     }
// });

// module.exports = router;
