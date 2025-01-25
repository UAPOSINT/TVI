export function requireClassification(level) {
  return async (req, res, next) => {
    const { user } = getAuth(req);
    if (!user || user.classification_level < level) {
      return res.status(403).json({ error: 'Insufficient clearance' });
    }
    return next();
  };
} 