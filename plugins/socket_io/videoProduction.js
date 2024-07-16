// /plugins/socket_io/videoProduction.js
const { sessionMiddleware, passportMiddleware, authenticate } = require('./socket_middleware');

const videoProductionHandlers = {
    onConnection: (nsp, socket, users) => {
        const user = socket.request.user;
        const userName = user.firstName;
        console.log(`VIDEOPRODUCTION.JS ~User: ${userName} connected to video_production`);

        users[socket.id] = { userName };

        socket.join('Overlay');
        socket.emit('overlay status', { message: 'Overlay connected' });

        nsp.to('Overlay').emit('user list', Object.values(users));

        socket.on('broadcast overlay', (overlayData) => {
            nsp.to('Overlay').emit('overlay update', overlayData);
            console.log(`Overlay data broadcasted: ${JSON.stringify(overlayData)}`);
        });

        socket.on('disconnect', () => {
            delete users[socket.id];
            nsp.to('Overlay').emit('user list', Object.values(users));
            console.log(`User: ${userName} disconnected from video_production`);
        });
    }
};

const configureVideoNamespace = (io) => {
    const nsp = io.of('/video_production');
    const users = {};

    nsp.use(sessionMiddleware);
    nsp.use(passportMiddleware);
    nsp.use(authenticate);

    nsp.on('connection', (socket) => {
        videoProductionHandlers.onConnection(nsp, socket, users);
    });
};

module.exports = {
    configureVideoNamespace
};
