import express from 'express';
const router = express.Router();
import event from "../../../plugins/mongo/models/calendar/Event.js"
router.get('/day',async(req,res)=>{
try{const events = await new Event().getAll()}
catch(error){console.error(error)}
})

export default router;