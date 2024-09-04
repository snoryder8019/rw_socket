import { savechatMessage, fetchLatestMessages } from './db.js';

export const socketGamesHandlers = {
  onConnection: (nsp, socket, users) => {
    const user = socket.request.user;
    const userName = user.firstName;
    console.log(`GAMES.JS ~ User: ${userName} connected to GAMES`);

    const avatarImage = user.images?.find((img) => img.avatarTag) || {};
    const avatarThumbnailUrl =
      avatarImage.thumbnailUrl || 'defaultThumbnail.png';

    users[socket.id] = { userName, avatarThumbnailUrl };
socket.on('join game session',(data)=>{
  socket.emit('games in session',{data})
})
  
  },
};
