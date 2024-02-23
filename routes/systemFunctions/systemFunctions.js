const fs = require('fs');

// Refactored function to read a specified log file
const readLogFile = async (filePath) => {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};
const gatherIp = async (req,res,next)=>{
  let userIp = req.ip
  console.log(`user's IP: ${userIp}`)
next()
}
module.exports = { readLogFile, gatherIp };
