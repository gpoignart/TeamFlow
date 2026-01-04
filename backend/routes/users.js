// backend/routes/users.js
const express = require('express');
const router = express.Router();
const User = require('../models/User'); 
const { authMiddleware } = require("../utils/auth");

// GET /users
router.get('/', authMiddleware, (req, res) => {
    try {
        const users = User.getAll();
        const safeUsers = users.map(User.toSafeObject);
        res.json(safeUsers);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /users (doesn't need to be protected for authenticated users)
router.post('/', async (req, res) => {
    try {
        //username, email, password et role allowed
        const { username, email, password, role } = req.body;
        
        // SImple Validation 
        if (!username || !password) {
            return res.status(400).json({ message: "Username et password needed" });
        }

        const newUser = await User.create({ username, email, password, role });
        res.status(201).json(User.toSafeObject(newUser));
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// PUT /users/:id
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const updates = req.body;
        delete updates.id; // Security: we prevent the ID from being changed
        
        const updatedUser = await User.update(req.params.id, updates);
        
        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(User.toSafeObject(updatedUser));
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
