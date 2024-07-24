const socketP2PHandlers = {
    onConnection: (nsp, socket) => {
        const user = socket.request.user;
        const userName = user.firstName;
        const userId = socket.id; // Using socket ID as user ID to ensure uniqueness
        const isAdmin = user.isAdmin; // Assume this is provided in user data
        console.log(`VIDEOSTREAM.JS ~ User: ${userName} connected to videoStream with ID: ${userId}`);
        socket.join('p2p');

        socket.on('getUserData', (callback) => {
            if (typeof callback === 'function') {
                callback({ isAdmin, userId });
            }
        });

        socket.on('p2pInit', (data) => {
            console.log(`Invite received from ${userName} with ID: ${data.from}`, { data });
            nsp.to('p2p').emit('p2pInit', { offer: data.offer, from: data.from });
        });

        socket.on('p2pAnswer', (data) => {
            console.log(`Answer received from ${userName} with ID: ${data.from}`, { data });
            nsp.to(data.to).emit('p2pAnswer', { answer: data.answer, from: data.from });
        });

        socket.on('ice', (data) => {
            console.log(`ICE candidate received from ${userName} with ID: ${data.from}`, { data });
            nsp.to(data.to).emit('ice', { candidate: data.candidate, from: data.from });
        });

        socket.on('disconnect', () => {
            console.log(`User ${userName} with ID: ${userId} disconnected`);
        });
    }
};

module.exports = socketP2PHandlers;
