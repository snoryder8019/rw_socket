const express = require('express');
const { getDb } = require('../../plugins/mongo/mongo');
const { ObjectId } = require('mongodb');

const forbiddenTerms = [
    '.env', 
    'DEBUG', 
    'php',
    'mysql',
    '_php',
    '_profiler',
    'manager',
    'ab2g',
    'ab2h'
    ]; // Replace with your actual forbidden terms

// Function to create regex patterns
function createRegexPatterns(terms) {
    return terms.map(term => new RegExp(term));

}

// Using the regex patterns to test a string
function isForbidden(string, patterns) {
    return patterns.some(pattern => pattern.test(string));
}

const noNos = async (req, res, next) => {
   
    const clientIP = req.ip; // Get client IP address
    const db = await getDb();
    const ipCollection = db.collection('sec_ipViolations');
    const ipRecord = await ipCollection.findOne({ ip: clientIP });

    // Combine all query parameters into a single string
    const pathString = req.path; 
    const queryString = Object.values(req.query).join(' ');
    const bodyString = req.body ? JSON.stringify(req.body) : ''; // Convert body to string
    const combinedString = pathString+' '+queryString + ' ' + bodyString;
    // Check if the query string contains forbidden terms
    if (isForbidden(combinedString, createRegexPatterns(forbiddenTerms))) {
        if (ipRecord && ipRecord.status === 'banned') {
            // IP is already banned
            console.log(`blocked action from ip: ${clientIP}`)
            return res.status(403).send('Forbidden');
        } else {
            // Update IP record or create a new one
            const update = {
                $inc: { violationCount: 1 },
                $set: { lastViolation: new Date() },
                $setOnInsert: { ip: clientIP }
            };
            const options = { upsert: true };
            await ipCollection.updateOne({ ip: clientIP }, update, options);

            // Check if the IP should be banned
            if (ipRecord && ipRecord.violationCount >= 3) {
                await ipCollection.updateOne({ ip: clientIP }, { $set: { status: 'banned' } });
                return res.status(403).send('Forbidden');
            } else {
                return res.status(403).send(`Forbidden action(s) detected, this is a warning. You dont have many until you are blocked`);
            }
        }
    } else {
        // No forbidden term found, proceed to the next middleware
        next();
    }
};

module.exports = noNos;
