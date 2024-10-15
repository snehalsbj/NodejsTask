const fs = require('fs');
const path = require('path');

const logFilePath = path.join(__dirname, '../logs/tasks.log');

const logTaskCompletion = (userId, timestamp) => {
    const logEntry = `User ID: ${userId}, Task completed at: ${timestamp}\n`;
    fs.appendFileSync(logFilePath, logEntry, 'utf8');
};

module.exports = { logTaskCompletion };
