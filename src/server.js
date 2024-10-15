const express = require('express');
const Redis = require('ioredis');
const taskQueue = require('./taskQueue');

const app = express();
app.use(express.json());

// Create a Redis client
const redis = new Redis();

// Rate limits configuration
const RATE_LIMIT_SECOND = 1; // 1 task per second
const RATE_LIMIT_MINUTE = 20; // 20 tasks per minute
const userRateLimits = {};

// Middleware to enforce rate limiting
const rateLimiter = (req, res, next) => {
    const userId = req.body.userId;

    if (!userRateLimits[userId]) {
        userRateLimits[userId] = {
            lastRequest: null,
            requestCount: 0,
        };
    }

    const currentTime = Date.now();

    // Reset the request count if a minute has passed
    if (userRateLimits[userId].lastRequest && currentTime - userRateLimits[userId].lastRequest > 60000) {
        userRateLimits[userId].requestCount = 0;
    }

    // Check if the rate limit is exceeded
    if (userRateLimits[userId].requestCount >= RATE_LIMIT_MINUTE) {
        return res.status(429).json({ error: 'Rate limit exceeded. Try again later.' });
    }

    // Check for 1 task per second rate limit
    if (userRateLimits[userId].lastRequest && currentTime - userRateLimits[userId].lastRequest < 1000) {
        // Queue the request
        taskQueue.add({ userId });
        return res.status(202).json({ message: 'Request queued. You will be notified when processed.' });
    }

    userRateLimits[userId].lastRequest = currentTime;
    userRateLimits[userId].requestCount += 1;

    // Process the task immediately
    taskQueue.add({ userId });

    next();
};

// Define the task route
app.post('/task', rateLimiter, (req, res) => {
    res.status(200).json({ message: 'Task submitted successfully.' });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
