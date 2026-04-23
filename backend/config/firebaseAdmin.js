require('dotenv').config();
const admin = require('firebase-admin');

const { normalizePrivateKey } = require('../utils/helpers');

let firestore = null;

try {
  if (
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY
  ) {
    if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: normalizePrivateKey(
        process.env.FIREBASE_PRIVATE_KEY
      ),
    }),
  });
}

    firestore = admin.firestore();
    console.log('✅ Firebase Admin initialized');
  } else {
    console.warn(
      '⚠️ Firebase Admin NOT initialized (missing environment variables)'
    );
  }
} catch (error) {
  console.warn(
    '⚠️ Firebase Admin initialization failed:',
    error.message
  );
}

module.exports = {
  admin,
  firestore,
};