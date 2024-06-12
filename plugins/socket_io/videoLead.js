// /plugins/socket_io/videoLead.js
const { configureNamespace } = require('./socketUtils');

const onVideoLeadConnection = (socket, nsp) => {
    console.log(`${socket.request.user.firstName} connected to /video_lead`);

    socket.on('video', (data) => {
        // Broadcast the video data to all connected clients
        socket.broadcast.emit('video', data);
    });

    socket.on('disconnect', () => {
        console.log(`${socket.request.user.firstName} disconnected from /video_lead`);
    });
};

module.exports.setupVideoLead = (io) => {
    configureNamespace(io, '/video_lead', onVideoLeadConnection);
};
