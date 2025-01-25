const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../../lib/db');
const { handleServerError } = require('../../lib/errors');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../../lib/email');

// Registration endpoint
router.post('/register', async (req, res) => {
    try {
        const { username, password, email } = req.body;

        // Validate input
        if (!username || !password || !email) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Check username format
        if (!/^[a-zA-Z0-9_-]{3,20}$/.test(username)) {
            return res.status(400).json({
                error: 'Username must be 3-20 characters and contain only letters, numbers, underscores, and hyphens'
            });
        }

        // Check email format
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        // Check password strength
        if (password.length < 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters long' });
        }

        // Check if username or email already exists
        const existingUser = await db.users.findFirst({
            where: {
                OR: [
                    { username },
                    { email }
                ]
            }
        });

        if (existingUser) {
            if (existingUser.username === username) {
                return res.status(400).json({ error: 'Username already taken' });
            }
            return res.status(400).json({ error: 'Email already registered' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(12);
        const password_hash = await bcrypt.hash(password, salt);

        // Generate verification token
        const verification_token = uuidv4();

        // Create user
        const newUser = await db.users.create({
            data: {
                id: uuidv4(),
                username,
                password_hash,
                email,
                classification_level: 1,
                contribution_score: 0,
                created_at: new Date(),
                verification_token,
                email_verified: false
            }
        });

        // Send verification email
        await sendVerificationEmail(email, verification_token);

        // Generate JWT
        const token = jwt.sign(
            { 
                id: newUser.id,
                username: newUser.username,
                classification_level: newUser.classification_level
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Return user info (excluding password)
        res.status(201).json({
            user: {
                id: newUser.id,
                username: newUser.username,
                classification_level: newUser.classification_level,
                contribution_score: newUser.contribution_score,
                email_verified: false
            },
            token
        });
    } catch (error) {
        handleServerError(res, error);
    }
});

// Email verification endpoint
router.get('/verify-email/:token', async (req, res) => {
    try {
        const { token } = req.params;

        const user = await db.users.findFirst({
            where: { verification_token: token }
        });

        if (!user) {
            return res.status(400).json({ error: 'Invalid verification token' });
        }

        // Update user
        await db.users.update({
            where: { id: user.id },
            data: {
                email_verified: true,
                verification_token: null
            }
        });

        res.json({ message: 'Email verified successfully' });
    } catch (error) {
        handleServerError(res, error);
    }
});

// Request password reset endpoint
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        const user = await db.users.findUnique({
            where: { email }
        });

        if (!user) {
            // Return success even if user not found for security
            return res.json({ message: 'If an account exists with this email, a password reset link has been sent' });
        }

        // Generate reset token
        const reset_token = uuidv4();
        const reset_expires = new Date(Date.now() + 3600000); // 1 hour

        // Update user
        await db.users.update({
            where: { id: user.id },
            data: {
                reset_password_token: reset_token,
                reset_password_expires: reset_expires
            }
        });

        // Send reset email
        await sendPasswordResetEmail(email, reset_token);

        res.json({ message: 'Password reset email sent' });
    } catch (error) {
        handleServerError(res, error);
    }
});

// Reset password endpoint
router.post('/reset-password', async (req, res) => {
    try {
        const { token, password } = req.body;

        if (!token || !password) {
            return res.status(400).json({ error: 'Token and password are required' });
        }

        if (password.length < 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters long' });
        }

        const user = await db.users.findFirst({
            where: {
                reset_password_token: token,
                reset_password_expires: {
                    gt: new Date()
                }
            }
        });

        if (!user) {
            return res.status(400).json({ error: 'Invalid or expired reset token' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(12);
        const password_hash = await bcrypt.hash(password, salt);

        // Update user
        await db.users.update({
            where: { id: user.id },
            data: {
                password_hash,
                reset_password_token: null,
                reset_password_expires: null
            }
        });

        res.json({ message: 'Password reset successful' });
    } catch (error) {
        handleServerError(res, error);
    }
});

// Login endpoint
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Find user
        const user = await db.users.findUnique({
            where: { username }
        });

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Verify password
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate JWT
        const token = jwt.sign(
            { 
                id: user.id,
                username: user.username,
                classification_level: user.classification_level
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Return user info
        res.json({
            user: {
                id: user.id,
                username: user.username,
                classification_level: user.classification_level,
                contribution_score: user.contribution_score
            },
            token
        });
    } catch (error) {
        handleServerError(res, error);
    }
});

// Get current user session
router.get('/session', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.json({ user: null });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await db.users.findUnique({
            where: { id: decoded.id }
        });

        if (!user) {
            return res.json({ user: null });
        }

        res.json({
            user: {
                id: user.id,
                username: user.username,
                classification_level: user.classification_level,
                contribution_score: user.contribution_score
            }
        });
    } catch (error) {
        res.json({ user: null });
    }
});

// Logout endpoint
router.post('/logout', (req, res) => {
    res.json({ success: true });
});

module.exports = router; 