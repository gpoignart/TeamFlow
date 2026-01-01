const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { authMiddleware } = require('../utils/auth');

// GET /stats
// Returns counts of users, tasks, and messages for the dashboard
router.get('/', authMiddleware, async (req, res) => {
    try {
        await db.read();

        const userCount = db.data.users ? db.data.users.length : 0;
        const taskCount = db.data.tasks ? db.data.tasks.length : 0;
        const messageCount = db.data.messages ? db.data.messages.length : 0;

        res.json({
            users: userCount,
            tasks: taskCount,
            messages: messageCount
        });
    } catch (err) {
        console.error("Error fetching stats:", err);
        res.status(500).json({ message: "Error fetching statistics" });
    }
});

module.exports = router;