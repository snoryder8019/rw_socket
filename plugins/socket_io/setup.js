import express from express;
import SocketIo from 'socket.io';
import configureNamespace from './namespace.js';
import mainChatHandlers from './mainChat.js';
import socketAdminHandlers from './socketAdmin.js';
import socketP2PHandlers from './videoStream.js';

export const router = express.Router();
router.use((req,res,socketIo,next)=>{
    const io = socketIo(server);
    req.io = io
    next()
})

//setupSocketIO is mounted to the app > /bin/www
//Configure new namespaces here
export const setupSocketIO = (server) => {
    const io = socketIo(server);
    configureNamespace(io, '/main_chat', mainChatHandlers);
configureNamespace(io,'/socketAdmin',socketAdminHandlers);
configureNamespace(io,'/videoStream',socketP2PHandlers);
};
