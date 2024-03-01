const socketIo = require('socket.io');
const sharedSession = require("express-socket.io-session");
const expressSession = require('express-session');

const session = expressSession({
  secret: "your secret",
  resave: true,
  saveUninitialized: true
});

const socketApi = {
  io: null,
  attach: function(server) {
    this.io = socketIo(server);
    this.io.use(sharedSession(session, { autoSave:true }));
    this.io.on('connection', (socket) => {
      console.log('A user connected');
      socket.on('chat message', (msg) => {
        this.io.emit('chat message', msg);
      });
      socket.on('disconnect', () => {
        console.log('User disconnected');
      });
    });
  }
};

module.exports = socketApi;
