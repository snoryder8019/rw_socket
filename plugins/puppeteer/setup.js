var express = require('express');
const config = require('../../config/config');
const puppeteer = require('puppeteer');
const { getDb } = require('../../plugins/mongo/mongo');
const { ObjectId } = require('mongodb');
const path = require('path');

var router = express.Router();
const util = require('util');
const generatePDF = async (url, elementId, outputPath) => {
    console.log(`Starting PDF generation for ${elementId} at ${url}`);
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  
    const page = await browser.newPage();
    await page.goto(url);
    console.log(`Page loaded: ${url}`);
    await page.waitForSelector(elementId);
    console.log(`Element found: ${elementId}`);
    await page.pdf({
        path: outputPath,
        format: 'A4',
        clip: {
            x: 0,
            y: 0,
            width: 800,
            height: 600,
        },
    pageRanges: '1',
});
console.log(`PDF generated: ${outputPath}`);
await browser.close();
console.log('Browser closed');
};

const exporterRoute = async (req, res,  user, card,confirmationId) => {
    console.log('Exporter route called');
   
    const util = require('util');
    //const orderId = req.query.orderId
    // Replace JSON.stringify with util.inspect
    //console.log(`User Data: ${util.inspect(user)}`);
    //console.log(`Card Data: ${util.inspect(card)}`);
    console.log(confirmationId)
    
    const url = `${config.baseUrl}exporter/?userId=${user}&cardId=${card}`;
    const elementId1 = '#cardFrontFrame';
   // const outputPath1 = `../finals/${user}_front.pdf`;
    const outputPath1 = path.join(__dirname, '../..', 'finals', `${confirmationId}_front.pdf`);
    const elementId2 = '#cardBackFrame';
    const outputPath2 = path.join(__dirname, '../..', 'finals', `${confirmationId}_back.pdf`);
   // const outputPath2 = `../finals/${user}_back.pdf`;
    
    try {
        console.log('Generating front PDF');
        await generatePDF(url, elementId1, outputPath1);
    console.log('Generating back PDF');
    await generatePDF(url, elementId2, outputPath2);
    console.log('PDFs generated successfully');
    res.status(200,'checkoutawaiting')
  } catch (error) {
    console.error('Error generating PDFs:', error);
    res.status(500).send('An error occurred while generating the PDFs.');
  }
};

const exporter =async (req,res)=>{
    try{
        const db = getDb();
        const users = db.collection(`users`);
        const cards = db.collection(`_cards`);
const userId = req.query.userId;
const cardId = req.query.cardId;
console.log(cardId)
const userObjId = new ObjectId(userId);
const cardObjId = new ObjectId(cardId);
const userResult = await users.findOne({ "_id": userObjId });
const cardResult = await cards.findOne({ "_id": cardObjId });

        console.log(`initiate exporter: \n\ncard:${cardResult}\nuser${userResult._id}`);
        res.render('exporter',{user:userResult,card:cardResult});
        }
        catch(error){
            console.error(error)
        }
};

module.exports = {
  generatePDF,
  exporterRoute,
  exporter
};
