const express = require('express');
const router = express.Router();
const { db } = require("../db");
const Message = require("../models/Message")
const { authMiddleware } = require("../utils/auth");

// GET /messages 
// Returns list of messages the current user can see, sorted by date (newest first)
router.get("/", authMiddleware, async (req, res) => {
    await db.read();
    const userId = req.user.id;
    const teamId = req.query.teamId; // <-- get teamId from query

    let messages = db.data.messages.filter(m =>
        (m.senderId == userId ||
        (m.recipientIds && m.recipientIds.includes(userId)) ||
        (!m.recipientIds || m.recipientIds.length === 0))
        && (!teamId || String(m.teamId) === String(teamId)) // <-- filter by teamId if provided
    );

    const users = db.data.users || [];
    messages = messages.map(msg => {
        const sender = users.find(u => String(u.id) === String(msg.senderId));
        return { ...msg, sender: sender ? { id: sender.id, username: sender.username, email: sender.email } : undefined };
    });

    messages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(messages);
});

// POST /messages (create a new message)
router.post("/", authMiddleware, async (req, res) => {
    await db.read();
    const userId = req.user.id;
    const { content, recipientIds, teamId } = req.body;

    if (!content || content.trim() === "") {
        return res.status(400).json({ error: "Message can't be empty." });
    }

    const currentMessageId = db.data.lastMessageId + 1;
    const finalRecipients = (Array.isArray(recipientIds) && recipientIds.length > 0) ? recipientIds : [];

    const newMessage = new Message({
        id: currentMessageId,
        content: content,
        senderId: userId,
        recipientIds: finalRecipients,
        teamId: teamId || null // <-- save teamId
    });

    db.data.messages.push(newMessage);
    db.data.lastMessageId = currentMessageId;

    await db.write();
    res.status(201).json(newMessage);
});
module.exports = router;