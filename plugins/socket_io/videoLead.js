module.exports.setupVideoLead = function(io) {
    const videoLead = io.of('/videoLead');
  
    videoLead.on('connection', (socket) => {
      console.log('A user connected to videoLead');
  
      socket.on('newVideo', (video) => {
        // Broadcast new video to all connected clients
        videoLead.emit('newVideo', video);
      });
  
      socket.on('scheduleVideoPush', () => {
        // Get all videos for the scheduled push
        // Assuming you have a Video model set up
        const Video = require('../../mongo/models/Video');
        Video.find().then((videos) => {
          videoLead.emit('scheduledVideos', videos);
        });
      });
  
      socket.on('disconnect', () => {
        console.log('A user disconnected from videoLead');
      });
    });
  };
  