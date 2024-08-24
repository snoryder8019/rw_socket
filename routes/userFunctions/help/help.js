import express from 'express';
import Faq from '../../../plugins/mongo/models/help/Faq.js';
import Help from '../../../plugins/mongo/models/help/Help.js';

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

router.get('/faqs', faqs);
// router.get('/how-to-videos',how-to-videos)
// router.get('/directions',directions)
// router.get('/tickets',tickets)
export default router;
