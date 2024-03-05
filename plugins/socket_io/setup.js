
const socketIo = require('socket.io');
const sharedsession = require("express-socket.io-session");
const passport = require('passport')
const { sessionMiddleware } = require('../../app'); // Adjust the path as necessary
const {sendConnectionMeta} = require('../mongo/socketFunctions/update')
module.exports.setupSocketIO = (server) => {
    const io = socketIo(server);    
    const mainChat = io.of('/main_chat'); 
    const users = {}; // Tracks connected users
    mainChat.use((socket, next) => {
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
      sessionMiddleware(socket.request, {}, next);
  
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
    });
      mainChat.on('connection', (socket) => {
        console.log('A user connected to main_chat');
        const userName = socket.request.user ? socket.request.user.firstName : 'Anonymous';
        socket.join('General');
        updateUsersList(mainChat, 'General');

        const socketInfo=socket
        console.log(`userName: ${userName}, socketinfo:${socketInfo}`);
        users[socket.id] = userName; // Add user to the list
//sendConnectionMeta('connection',user)
        io.emit('user list', Object.values(users));
        // Listen for video streaming data from clients
        socket.on('stream', (data) => {
            // Broadcast the video data to all connected clients
            io.emit('stream', data);
        });

        // Listen for chat messages from clients
        socket.on('chat message', (msg) => {
          mainChat.to('General').emit('chat message', userName + ': ' + msg);
          console.log(msg)
      });
       socket.on('join room', (room) => {
            socket.join(room);
            // Update users list for the room
            updateUsersList(mainChat, room);
        });
        socket.on('chat message in room', ({ room, msg }) => {
          console.log(`message in ${room}: ${msg}`);
          mainChat.to(room).emit('chat message', msg);
        });
        // Handle disconnection
        socket.on('disconnect', () => {
          // Update users list upon disconnect
          updateUsersList(mainChat, 'General'); // Adjust this if the user can be in multiple rooms
      });
    });
    function updateUsersList(namespace, room) {
      // Implement logic to update and broadcast the user list for the room
      // This could involve tracking users in a data structure and emitting the updated list
      namespace.to(room).emit('user list', /* Updated users list */);
  }
};
