require('dotenv').config();
const admin = require('firebase-admin');

function normalizePrivateKey(raw) {
  if (!raw) return '';
  let k = raw.trim();
  if (k.endsWith(',')) k = k.slice(0, -1).trim();
  if ((k.startsWith('"') && k.endsWith('"')) || (k.startsWith("'") && k.endsWith("'"))) {
    k = k.slice(1, -1);
  }
  return k.replace(/\\n/g, '\n');
}

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: normalizePrivateKey(process.env.FIREBASE_PRIVATE_KEY),
  }),
});

(async () => {
  const db = admin.firestore();
  const snap = await db.collectionGroup('wishlist').get();
  console.log(`Found ${snap.size} wishlist docs.`);
  let updated = 0;
  const batch = db.batch();
  snap.forEach(doc => {
    batch.update(doc.ref, { lastNotifiedPrice: null });
    updated++;
  });
  await batch.commit();
  console.log(`Cleared lastNotifiedPrice on ${updated} docs.`);
  process.exit(0);
})().catch(err => {
  console.error(err);
  process.exit(1);
});
