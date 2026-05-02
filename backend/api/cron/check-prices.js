const { db } = require("../../config/firebase");
const { collection, getDocs, doc, setDoc, serverTimestamp } = require("firebase/firestore");

const { serpapiSearch } = require("../../services/searchService");
const { extractPrice } = require("../../utils/helpers");

module.exports = async (req, res) => {
  try {
    console.log("🔥 CRON RUNNING");

    const queueRef = collection(db, "priceCheckQueue");
    const snapshot = await getDocs(queueRef);

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();

      if (!data.isActive) continue;

      const productId = data.productId;
      const productName = data.productName;

      console.log("Checking:", productName);

      // 🔍 Fetch latest prices
      const results = await serpapiSearch(productName);

      if (!results.length) continue;

      const prices = results
        .map(r => Number(extractPrice(r.price)) || 0)
        .filter(p => p > 1000 && p < 200000);

      if (!prices.length) continue;

      const bestPrice = Math.min(...prices);

      const today = new Date().toISOString().split("T")[0];

      // 💾 SAVE TO FIRESTORE
      await setDoc(
        doc(db, "priceHistory", String(productId), "daily", today),
        {
          price: bestPrice,
          createdAt: serverTimestamp(),
        }
      );

      console.log(`Saved ${productName} → ₹${bestPrice}`);
    }

    return res.json({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Cron failed" });
  }
};