export const socketAdminHandlers = {
  onConnection: (nsp, socket, users) => {
    const user = socket.request.user;
    const userName = user.firstName;
    console.log(`SOCKETADMIN.JS ~ User: ${userName} connected to socketAdmin`);
    if (user.isAdmin) {
      console.log(`Admin Status: ${user.isAdmin}`);

      socket.join('Admin');

      socket.on('broadcast', (videoUrl) => {
        console.log(`SOCKETADMIN broadcast: ${videoUrl}`);
        nsp.to('main_chat').emit('broadcast', videoUrl);
      });

      socket.on('marquee', (data) => {
        console.log(`marquee hit: ${data.message}`);
        nsp.to('main_chat').emit('marquee', data);
      });
    } else {
      console.log(`Admin Status: ${user.isAdmin}`);
    }
  },
};
