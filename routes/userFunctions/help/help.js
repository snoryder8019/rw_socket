const express = require('express');
const router = express.Router();
const Faq = require('../../../plugins/mongo/models/help/Faq')
const Help = require('../../../plugins/mongo/models/help/Help')
const faqs = async(req,res)=>{
    try{
        const faqs = await new Faq().getAll();
        console.clear(faqs)
        res.render('help/faq',{faqs:faqs}
        )
    }
    catch(error){console.error(error)}
}




router.get('/faqs',faqs)
// router.get('/how-to-videos',how-to-videos)
// router.get('/directions',directions)
// router.get('/tickets',tickets)
module.exports = router;