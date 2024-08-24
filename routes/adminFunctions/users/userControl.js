var express = require('express');
var router = express.Router();
const path = require('path')
const upload = require('../../../plugins/multer/setup');
const { ObjectId } = require('mongodb');
const config = require('../../../config/config'); // Import config if you're using it
const fs = require('fs');
const getUserEditor = async(req,res)=>{
    try{

res.render('userEditor',{user:user})
    }
    catch(error){
        res.send(`error: ${error}`)
        
    }
}
const postUserEdit = async (req, res) => {
    try {
  

        res.redirect('/admin'); // Redirect to admin page after successful edit
    } catch (error) {
        res.send(`Error: ${error}`);
    }
};





module.exports= {getUserEditor, postUserEdit}