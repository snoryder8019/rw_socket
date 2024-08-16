import express from 'express';

const router = express.Router();
router.get('/generalEditor', async (req, res) => {
  res.render('generalEditor');
});

export default router;
