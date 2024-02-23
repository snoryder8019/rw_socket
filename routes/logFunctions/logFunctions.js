var express = require('express');
var router = express.Router();
const fs = require('fs');
const path = require('path');

function lib(msg, err, data, filename, logType) {
  // Define the log file path
  const logPath = path.join(__dirname, `../../logs/${filename}`);

  // Create a log entry
  const logEntry = {
    date: new Date().toISOString(),
    message: msg || null,
    error: err ? err.toString() : null, // Convert error to string if it exists
    data: data || null
  };

  fs.readFile(logPath, { encoding: 'utf8', flag: 'a+' }, (readErr, fileData) => {
    let logs = {};
    if (!readErr && fileData) {
      try {
        // Parse existing data as JSON object
        logs = JSON.parse(fileData);
      } catch (parseErr) {
        console.error(`Failed to parse existing log data: ${parseErr}`);
        // Initialize logs with an empty object or a predefined structure if parsing fails
        logs = {};
      }
    }

    // Check if the logType key exists, if not, initialize it
    if (!logs[logType]) {
      logs[logType] = [];
    }

    // Append the new log entry to the specific log type
    logs[logType].push(logEntry);

    // Write the updated logs back to the file
    fs.writeFile(logPath, JSON.stringify(logs, null, 2), (writeErr) => {
      if (writeErr) {
        console.error(`Failed to write to log: ${writeErr}`);
      }
    });
  });
}

module.exports = lib;
