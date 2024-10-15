const Queue = require('bull');
const { logTaskCompletion } = require('./taskHandler');

const taskQueue = new Queue('taskQueue');

taskQueue.process(async (job) => {
    const { userId } = job.data;
    const timestamp = new Date().toISOString();
    logTaskCompletion(userId, timestamp);
});

module.exports = taskQueue;
