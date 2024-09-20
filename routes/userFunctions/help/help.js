import express from 'express';
import Faq from '../../../plugins/mongo/models/help/Faq.js';
import Help from '../../../plugins/mongo/models/help/Help.js';
import Video from '../../../plugins/mongo/models/Video.js';
const router = express.Router();
const faqs = async (req, res) => {
  try {
    const faqs = await new Faq().getAll();
    console.clear(faqs);
    res.render('help/faq', { faqs: faqs });
  } catch (error) {
    console.error(error);
  }
};
const helpVideos = async (req, res) => {
  try {
    const videos = await new Video().getAll({ help: true }); // Fetch videos where help is true
    res.render('help/helpVideos', { videos: videos, className: 'helpVideos' }); // Pass the videos and class to the view
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching videos');
  }
};
router.get('/faqs', faqs);
router.get('/helpVideos', helpVideos)
// router.get('/how-to-videos',how-to-videos)
// router.get('/directions',directions)
// router.get('/tickets',tickets)
export default router;
