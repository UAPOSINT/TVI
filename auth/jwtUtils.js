const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const generateTokens = async (user) => {
    const accessToken = jwt.sign(
        { userId: user.id, level: user.classification_level },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
    );
    
    const refreshToken = crypto.randomBytes(64).toString('hex');
    
    // Store refresh token in database with expiry
    await db.refreshTokens.create({
        data: {
            token: refreshToken,
            user_id: user.id,
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
    });
    
    return { accessToken, refreshToken };
};

const verifyJWT = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET, {
            algorithms: ['HS256'],
            ignoreExpiration: false
        });
    } catch (error) {
        throw new AuthError('Invalid token');
    }
};

// In login route
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await authenticateUser(username, password);
    
    const { accessToken, refreshToken } = generateTokens(user);
    
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
    });
    
    res.json({ accessToken });
}); 