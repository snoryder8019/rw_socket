
const socketIo = require('socket.io');
const sharedsession = require("express-socket.io-session");
const passport = require('passport')
const { sessionMiddleware } = require('../../app'); // Adjust the path as necessary
module.exports.setupSocketIO = (server) => {
    const io = socketIo(server);
    
    
    const users = {}; // Tracks connected users
    // Set up Socket.IO events

    // io.use(sharedsession(sessionMiddleware, {
    //     autoSave:true
    //   }));

    function onlyForHandshake(middleware) {
        return (req, res, next) => {
          const isHandshake = req._query.sid === undefined;
          if (isHandshake) {
            middleware(req, res, next);
          } else {
            next();
          }
        };
      }
      
      io.engine.use(onlyForHandshake(sessionMiddleware));
      io.engine.use(onlyForHandshake(passport.session()));
      io.engine.use(
        onlyForHandshake((req, res, next) => {
          if (req.user) {
            next();
          } else {
            res.writeHead(401);
            res.end();
          }
        }),
      );


    io.on('connection', (socket) => {
        console.log('A user connected');
        const userName = socket.request.user.firstName;
        console.log(userName);
        users[socket.id] = userName; // Add user to the list

        io.emit('user list', Object.values(users));
        // Listen for video streaming data from clients
        socket.on('stream', (data) => {
            // Broadcast the video data to all connected clients
            io.emit('stream', data);
        });

        // Listen for chat messages from clients
        socket.on('chat message', (msg) => {
            console.log('message: ' + msg);
            // Broadcast the message to all connected clients
            io.emit('chat message', msg);
        });

        // Handle disconnection
        socket.on('disconnect', () => {
            delete users[socket.id]; // Remove user from the list
            io.emit('user list', Object.values(users));
            console.log('User disconnected');
        });
    });
};
