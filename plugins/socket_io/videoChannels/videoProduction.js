const Video = require('../../mongo/models/Video'); // Adjust the path as needed

module.exports.setupVideoChannel = function(io) {
  const videoProduction = io.of('/videoProduction');

  videoProduction.on('connection', (socket) => {
    console.log('A user connected to videoProduction');

    socket.on('newVideo', async (video) => {
      // Broadcast new video to all connected clients
      videoProduction.emit('newVideo', video);
    });

    socket.on('scheduleVideoPush', async () => {
      // Get all videos for the scheduled push
      const videos = await Video.find();
      videoProduction.emit('scheduledVideos', videos);
    });

    socket.on('disconnect', () => {
      console.log('A user disconnected from videoProduction');
    });
  });
};
