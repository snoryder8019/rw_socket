import express from "express";
import Blog from "../../../plugins/mongo/models/blog/Blog.js"
import Vote from "../../../plugins/mongo/models/blog/Vote.js"
const router = express.Router();
router.get('/reader',async(req,res)=>{
    const blogs =  await new Blog().getAll();
    console.log(blogs)
})
export default router