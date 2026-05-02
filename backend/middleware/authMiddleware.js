const { admin } = require('../config/firebaseAdmin');

async function verifyFirebaseToken(
  req,
  res,
  next
) {
  try {
    const authHeader =
      req.headers.authorization;

    if (
      !authHeader ||
      !authHeader.startsWith('Bearer ')
    ) {
      return res.status(401).json({
        error: 'Unauthorized: Missing token',
      });
    }

    const idToken = authHeader.split(' ')[1];
if (!admin || !admin.apps || !admin.apps.length){  return res.status(503).json({
    error: 'Authentication service unavailable',
  });
}
    const decodedToken =
      await admin.auth().verifyIdToken(
        idToken
      );

    req.user = decodedToken;

    next();
  } catch (error) {
    console.error(
      '[Auth Middleware Error]:',
      error.message
    );

    return res.status(401).json({
      error: 'Unauthorized: Invalid token',
    });
  }
}

module.exports = {
  verifyFirebaseToken,
};