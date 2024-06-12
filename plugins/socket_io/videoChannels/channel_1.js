// plugins/socket_io/videoChannels/channel_1.js

const onChannelConnection = (socket) => {
    console.log('A user connected to /video_channel_1');

    socket.on('video', (data) => {
        socket.broadcast.emit('video', data);
    });

    socket.on('ice-candidate', (candidate) => {
        socket.broadcast.emit('ice-candidate', candidate);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected from /video_channel_1');
    });
};

module.exports.setupVideoChannel = (io) => {
    const nsp = io.of('/video_channel_1');
    nsp.on('connection', (socket) => {
        onChannelConnection(socket, nsp);
    });
};
