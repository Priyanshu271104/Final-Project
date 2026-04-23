const {
  admin,
  firestore,
} = require('../config/firebaseAdmin');

const {
  extractPrice,
} = require('../utils/helpers');

const {
  serpapiSearch,
} = require('./searchService');
const {
  sendDropEmail,
  sendTargetReachedEmail,
} = require('./emailService');

const CRON_BATCH_SIZE = parseInt(
  process.env.CRON_BATCH_SIZE || '5',
  10
);

const PRICE_DROP_THRESHOLD_PCT = parseFloat(
  process.env.PRICE_DROP_THRESHOLD_PCT || '5'
);

function extractLatestPrice(results) {
  if (!results || results.length === 0) {
    return {
      price: 0,
      link: null,
    };
  }

  const first = results[0];

  const price =
  extractPrice(first.price);

  return {
    price,
    link: first.link || null,
  };
}

async function getProductsToCheck() {
  const snapshot = await firestore
    .collection('priceCheckQueue')
    .where('isActive', '==', true)
    .orderBy('lastCheckedAt', 'asc')
    .limit(CRON_BATCH_SIZE)
    .get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

async function processWishlistItem(
  item,
  newPrice,
  newLink,
  report
) {
  const baseline =
    item.data.baselinePrice ||
    item.data.currentPrice;

  const lastNotified =
    item.data.lastNotifiedPrice || null;

  const dropPct =
    ((baseline - newPrice) / baseline) * 100;

  const notifyEnabled =
    item.data.notifyEmail !== false;

  const shouldNotifyDrop =
    notifyEnabled &&
    dropPct >= PRICE_DROP_THRESHOLD_PCT &&
    (
      lastNotified === null ||
      newPrice < lastNotified
    );

  const targetPrice =
    typeof item.data.targetPrice === 'number'
      ? item.data.targetPrice
      : null;

  const lastTargetNotified =
    typeof item.data.lastTargetNotifiedPrice ===
    'number'
      ? item.data.lastTargetNotifiedPrice
      : null;

  const shouldNotifyTarget =
    notifyEnabled &&
    targetPrice !== null &&
    newPrice <= targetPrice &&
    (
      lastTargetNotified === null ||
      newPrice < lastTargetNotified
    );

  const updates = {
    lastCheckedPrice: newPrice,
    lastCheckedAt:
      admin.firestore.FieldValue.serverTimestamp(),
  };

  let user = null;

  if (shouldNotifyDrop || shouldNotifyTarget) {
    const userId = item.ref.parent.parent.id;

    const userDoc = await firestore
      .collection('users')
      .doc(userId)
      .get();

    user = userDoc.data();
  }

  if (shouldNotifyDrop && user?.email) {
    const result = await sendDropEmail({
      to: user.email,
      displayName: user.displayName,
      productName: item.data.name,
      oldPrice: baseline,
      newPrice,
      link: newLink,
    });

    if (result.sent) report.emailsSent++;
    if (result.stubbed) report.emailsStubbed++;

    updates.lastNotifiedPrice = newPrice;
  }

  if (shouldNotifyTarget && user?.email) {
    const result =
      await sendTargetReachedEmail({
        to: user.email,
        displayName: user.displayName,
        productName: item.data.name,
        targetPrice,
        newPrice,
        link: newLink,
      });

    if (result.sent) report.emailsSent++;
    if (result.stubbed) report.emailsStubbed++;

    updates.lastTargetNotifiedPrice = newPrice;
  }

  await item.ref.update(updates);
}

async function checkPricesOnce() {
  if (!firestore) {
    throw new Error(
      'Firestore not initialized'
    );
  }

  const productsToCheck =
    await getProductsToCheck();

  const report = {
    groupsChecked: 0,
    emailsSent: 0,
    emailsStubbed: 0,
    failures: 0,
  };

  for (const product of productsToCheck) {
    try {
      const results =
        await serpapiSearch(
          product.productName
        );

      const {
        price: newPrice,
        link: newLink,
      } = extractLatestPrice(results);

      if (!newPrice) {
        report.groupsChecked++;
        continue;
      }

      const wishlistSnapshot =
        await firestore
          .collectionGroup('wishlist')
          .where(
            'id',
            '==',
            product.productId
          )
          .get();

      for (const doc of wishlistSnapshot.docs) {
        await processWishlistItem(
          {
            ref: doc.ref,
            data: doc.data(),
          },
          newPrice,
          newLink,
          report
        );
      }

      await firestore
        .collection('priceCheckQueue')
        .doc(product.id)
        .update({
          lastCheckedAt:
            admin.firestore.FieldValue.serverTimestamp(),
        });

      report.groupsChecked++;
    } catch (error) {
      console.error(
        '[cron] product failed:',
        product.productName,
        error.message
      );

      report.failures++;
    }
  }

  return report;
}

module.exports = {
  checkPricesOnce,
};