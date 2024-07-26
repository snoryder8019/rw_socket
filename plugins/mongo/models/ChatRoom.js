const ModelHelper = require('../helpers/models');

class ChatRoom extends ModelHelper {
  constructor(chatRoomData) {
    super('chat_rooms_meta');
    if (chatRoomData) {
this.roomName = chatRoomData.roomName;
this.active = chatRoomData.active;
this.createdBy = chatRoomData.createdBy;
this.createdOn = chatRoomData.createdOn || new Date();
this.lastMessage = chatRoomData.lastMessage;
this.messages = chatRoomData.messages;
this.moderatedBy = chatRoomData.moderatedBy;
this.restrictions = chatRoomData.restrictions || [];
this.tags = chatRoomData.tags || [];
this.testMode = chatRoomData.testMode;
this.clubName = chatRoomData.clubName || []; 
    }}}
    module.exports=ChatRoom;