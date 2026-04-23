require('dotenv').config();

const {
  firestore,
} = require('../config/firebaseAdmin');

async function resetNotifiedPrices() {
  if (!firestore) {
    throw new Error(
      'Firestore not initialized'
    );
  }

  const snapshot =
    await firestore
      .collectionGroup('wishlist')
      .get();

  console.log(
    `Found ${snapshot.size} wishlist documents`
  );

  const docs = snapshot.docs;
  const batchSize = 400;

  for (
    let i = 0;
    i < docs.length;
    i += batchSize
  ) {
    const batch =
      firestore.batch();

    const chunk = docs.slice(
      i,
      i + batchSize
    );

    chunk.forEach((doc) => {
      batch.update(doc.ref, {
  lastNotifiedPrice: null,
  lastTargetNotifiedPrice: null,
});
    });

    await batch.commit();

    console.log(
      `Updated batch ${
        i / batchSize + 1
      }`
    );
  }

  console.log(
    'Reset completed successfully'
  );
}

resetNotifiedPrices()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });