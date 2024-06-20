const env = require('dotenv').config()
const config = 
{
    //breaking changes below
    "env":"dev",//test,prod,
    "app_name":"rw_socket",
    "DB_NAME":"rw_socket", 
    "DB_URL":process.env.DB_URL,
    "baseUrl": process.env.BASE_URL,
    'ticketsEmail':"scott@w2marketing.biz",
    "emailService":"smtp.office365.com",
    //end breakiung changes
    //**********
    //custom changes below
    "title":"Royal World Socket Platform",
    "headline":"Welcome to our Test Platform!",
    "footerMessage":"config footer message",
    "companyPaypal":process.env.PPAL_CID,
    "baseShipping":"9.00",
    "baseTransaction":"1.00"
}
module.exports = config