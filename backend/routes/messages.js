const express = require('express');
const router = express.Router();
const { db } = require("../db");
const Message = require("../models/Message")
const { authMiddleware } = require("../utils/auth");

// GET /messages 
// Returns list of messages the current user can see, sorted by date (newest first)
router.get("/", authMiddleware, async (req, res) => {
    await db.read(); // update db object with db.json

    const userId = req.user.id; 
    
    // Filter: 
    // 1. User is sender
    // 2. User is in recipient list
    // 3. Message has NO recipient list (Global/Public message)
    const messages = db.data.messages.filter(m =>
        m.senderId == userId || 
        (m.recipientIds && m.recipientIds.includes(userId)) ||
        (!m.recipientIds || m.recipientIds.length === 0)
    ); 

    // Sort newest to oldest
    messages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); 

    res.json(messages); 
});

// POST /messages (create a new message)
router.post("/", authMiddleware, async (req, res) => {
    await db.read(); 

    const userId = req.user.id; 
    
    // RecipientIds is optional now. If missing/empty, it's a public message.
    const { content, recipientIds } = req.body; 

    if (!content || content.trim() === "") {
        return res.status(400).json({ error: "Message can't be empty." }); 
    }

    const currentMessageId = db.data.lastMessageId + 1; 

    // Ensure recipientIds is an array if provided, otherwise empty array
    const finalRecipients = (Array.isArray(recipientIds) && recipientIds.length > 0) 
        ? recipientIds 
        : [];

    const newMessage = new Message({ 
        id: currentMessageId, 
        content: content, 
        senderId: userId, 
        recipientIds: finalRecipients 
    });

    db.data.messages.push(newMessage); 
    db.data.lastMessageId = currentMessageId; 

    await db.write(); 
    res.status(201).json(newMessage); 
})

module.exports = router;