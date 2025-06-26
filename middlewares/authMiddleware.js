const { admin } = require('../firebase/firebaseAdmin');

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Unauthorized: Missing or invalid token' });
  }

  const idToken = authHeader.split(' ')[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken; // You can access this in your routes
    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    res.status(401).json({ success: false, message: 'Unauthorized: Invalid token' });
  }
};

module.exports = authenticate;
