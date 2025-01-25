export const requireClassification = (level) => {
    return (req, res, next) => {
        if (req.user.classification_level < level) {
            return res.status(403).json({
                error: `Requires classification level ${level}+`,
                current_level: req.user.classification_level
            });
        }
        next();
    };
};

// Usage in routes
router.put('/articles/:id/metadata', 
    authMiddleware, 
    requireClassification(4),
    async (req, res) => {
        // Metadata update logic
    }
); 