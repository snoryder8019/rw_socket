//plugins/socket_io/videoStream.js
/////////////////////
//////////////////////
//we want socket io to exchange the invite and asnswer and gather the ice candidates for p2p
//socket emit 'p2pInit', emit 'p2pAnswer', 
//design classes "client_window","client_camera", "peers", "peer", "P2Pcontrols", "P2Pcontrol"
//client camera sits in client window, a peer sits in the peers, a button for P2Pcontrol sits in the P2Pcontrols
const socketP2PHandlers = {
    onConnection:(nsp, socket,users)=>{
        const user =socket.request.user
        const userName = user.firstName;
        console.log(`VIDEOSTREAM.JS ~ User: ${userName} connected to videoStream`)
        
    }
}
module.exports = socketP2PHandlers;