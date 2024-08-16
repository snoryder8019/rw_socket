const express = require('express');
const router = express.Router();

router.get('/generalEditor', async (req, res) => {
  res.render('generalEditor');
});

module.exports = router;
