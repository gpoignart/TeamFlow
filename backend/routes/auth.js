// backend/routes/auth.js

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs'); // To compare the hashed password

// Import local dependencies
const { db } = require('../db'); // Access to the Lowdb database
const { generateToken } = require('../utils/auth'); // Token generator
const User = require('../models/User'); // User model for toSafeObject method

/**
 * Route POST /auth/register
 * Create a new user and return a token
 */
router.post('/register', async (req, res) => {
    const { username, email, password, role } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }

    try {
        const newUser = await User.create({ username, email, password, role });

        const token = generateToken(newUser);

        const safeUser = User.toSafeObject(newUser);

        res.status(201).json({
            message: 'User registered successfully',
            user: safeUser,
            token
        });
        
    } catch (err) {
        console.error('Error during registration:', err.message);
        res.status(400).json({ message: err.message });
    }
});


/**
 * Route POST /auth/login
 * Authenticates the user and returns a JWT.
 */
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }

    try {
        // 1. Search for the user in the Lowdb database
        // Array.prototype.find() is used here as db.data.users is an array.
        const userData = db.data.users
                           .find(u => u.username === username);

        if (!userData) {
            // Use a generic message not to reveal whether the username or password is wrong
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        // 2. Verify the hashed password (bcrypt)
        // Comparison of the plain password (password) with the stored hash (userData.password)
        const isPasswordValid = await bcrypt.compare(password, userData.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        // 3. Generate the JWT
        const token = generateToken(userData);

        // 4. Prepare the safe user object for the response
        const safeUser = User.toSafeObject(userData); // Uses the method from User.js to remove the password hash

        // 5. Success response
        res.json({
            message: 'Login successful',
            token: token,
            user: safeUser 
        });

    } catch (error) {
        console.error('Error during authentication:', error);
        // Internal error, typically related to the database or the bcrypt process
        res.status(500).json({ message: 'Internal server error during login.' });
    }
});

module.exports = router;
