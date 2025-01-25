const nodemailer = require('nodemailer');

// Create reusable transporter
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

// Send verification email
async function sendVerificationEmail(email, verificationToken) {
    const verificationUrl = `${process.env.SITE_URL}/verify-email?token=${verificationToken}`;
    
    await transporter.sendMail({
        from: `"The Veil Institute" <${process.env.SMTP_FROM}>`,
        to: email,
        subject: "Verify Your Email - The Veil Institute",
        html: `
            <h1>Welcome to The Veil Institute</h1>
            <p>Please verify your email address by clicking the link below:</p>
            <p><a href="${verificationUrl}">${verificationUrl}</a></p>
            <p>This link will expire in 24 hours.</p>
            <p>If you did not create an account, please ignore this email.</p>
        `
    });
}

// Send password reset email
async function sendPasswordResetEmail(email, resetToken) {
    const resetUrl = `${process.env.SITE_URL}/reset-password?token=${resetToken}`;
    
    await transporter.sendMail({
        from: `"The Veil Institute" <${process.env.SMTP_FROM}>`,
        to: email,
        subject: "Password Reset - The Veil Institute",
        html: `
            <h1>Password Reset Request</h1>
            <p>You requested to reset your password. Click the link below to proceed:</p>
            <p><a href="${resetUrl}">${resetUrl}</a></p>
            <p>This link will expire in 1 hour.</p>
            <p>If you did not request a password reset, please ignore this email.</p>
        `
    });
}

module.exports = {
    sendVerificationEmail,
    sendPasswordResetEmail
}; 