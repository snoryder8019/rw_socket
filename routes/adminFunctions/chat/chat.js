const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const ChatMessage = require('../../../plugins/mongo/models/ChatMessage'); // Adjust the path to your models
const Clubs = require('../../../plugins/mongo/models/Club'); // Adjust the path to your models
const ChatRoom = require('../../../plugins/mongo/models/ChatRoom'); // Adjust the path to your models

const router = express.Router();

router.get('/load', async (req, res) => {
    try {
        console.log('/load clubs');
        const chats = await new ChatMessage().getAll();
        const chatRooms = await new ChatRoom().getAll();
        const clubs = await new Clubs().getAll();
        console.log(chats);

        // Read the HTML template
      //  const htmlFilePath = path.join(__dirname, '../../html', 'chatSupport.html');
      //  let htmlTemplate = await fs.readFile(htmlFilePath, 'utf8');

        // Create the dropdown options HTML
      //  const clubOptions = clubs.map(club => `<option value="${club.id}">${club.name}</option>`).join('');
        
        // Create the chat rooms list HTML
      //  const chatRoomsList = chatRooms.map(chatRoom => 
       //     `<button class="deleteChatRoomButton" roomId="${chatRoom._id}">delete ${chatRoom.roomName}</button>`
      //  ).join('');

        // Inject the club options and chat rooms list into the HTML template
       // htmlTemplate = htmlTemplate.replace('<!-- CLUBS_DROPDOWN -->', `<select id="clubsDropdown" name="clubName">${clubOptions}</select>`);
      //  htmlTemplate = htmlTemplate.replace('<!-- CHAT_ROOMS_LIST -->', chatRoomsList);

      //  res.send(htmlTemplate);
      res.render('admin/chat/chatSupport',{
        chats:chats,
        chatRooms:chatRooms,
        clubs:clubs
      })
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

router.post('/createChatRoom', async (req, res) => {
    try {
        const chatRoomData = req.body;
        await new ChatRoom().create(chatRoomData);
        
        req.flash('success','created chatroom')
        res.send('Chat room created successfully');
    } catch (error) {
        req.flash('error',error)
        console.error('Failed to create chat room:', error);
        res.status(500).send('Failed to create chat room: ' + error.message);
    }
});

module.exports = router;
