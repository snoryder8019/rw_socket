// /routes/adminFunctions/videoLead/videoLead.js
const express = require('express');
const router = express.Router();

const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect('/login'); // Redirect to login if not authenticated
  }
};

const ensureVideoLeadPermission = (req, res, next) => {
  if (req.user && req.user.permissions && req.user.permissions.videoLead) {
    return next();
  } else {
    res.status(403).send('Forbidden: You do not have access to this resource');
  }
};

router.get('/load', ensureAuthenticated, ensureVideoLeadPermission, (req, res) => {
  console.log("Rendering /load route for video lead");
  res.send(`
    <div id="videoContainer">
      <h1>Video Lead</h1>
      <video id="video" autoplay></video>
      <button id="startButton">Start Streaming</button>
    </div>
    <div id="videoFeed"></div>
  `);
});

module.exports = router;
