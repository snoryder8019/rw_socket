const ModelHelper = require('../helpers/models');

class ChatMessage extends ModelHelper {
  constructor(chatMessageData) {
    super('chat_messages_meta');
    if (chatMessageData) {
   
      this.roomId = chatMessageData.roomId;
      this.avatarType = chatMessageData.avatarType;
      this.chatType = chatMessageData.chatType;
      this.chatStyle = chatMessageData.chatStyle;
      this.avatarStyle = chatMessageData.avatarStyle;
      this.emojis = chatMessageData.emojis || [];
      this.flagged = chatMessageData.flagged;
      this.likes = chatMessageData.likes || [];
      this.message = chatMessageData.message;
      this.messageDate = chatMessageData.messageDate;
      this.respondedTo = chatMessageData.respondedTo;
      this.sharedBy = chatMessageData.sharedBy || [];
      this.user = chatMessageData.user;
      this.visible = chatMessageData.visible;
      this.reviewed = chatMessageData.reveiwed;
      this.reviewedBy= chatMessageData.reviewedBy || [];
      this.thumbnailUrl = chatMessageData.thumbnailUrl;
      
    }
  }
}

module.exports = ChatMessage;
