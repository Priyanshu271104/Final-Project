require("dotenv").config();

const app = require("./app");
const cron = require("node-cron");
const admin = require("firebase-admin");
const transporter = require("./config/email");
const fetchPriceFromSerp = require("./services/priceFetcher");

// 🔥 INIT FIREBASE
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);

  // 🔥 DAILY CRON (12 AM IST)
  cron.schedule(
    "0 0 * * *",
    async () => {
      console.log("🔁 Running price tracker...");

      const snapshot = await db
        .collection("priceCheckQueue")
        .where("isActive", "==", true)
        .get();

      for (const doc of snapshot.docs) {
        const data = doc.data();
        const productId = data.productId;

        try {
          console.log("Checking:", productId);

          const historyRef = db
            .collection("priceHistory")
            .doc(productId)
            .collection("daily");

          // 🔍 LAST PRICE
          const prevSnapshot = await historyRef
            .orderBy("checkedAt", "desc")
            .limit(1)
            .get();

          let oldPrice = null;

          if (!prevSnapshot.empty) {
            oldPrice = prevSnapshot.docs[0].data().price;
          }

          // 🔥 FETCH REAL PRICE
          const newPrice = await fetchPriceFromSerp(data.productName);

          if (!newPrice) {
            console.log("⚠️ Skipping (no price)");
            continue;
          }

          const targetPrice = data.targetPrice ?? null;
          const userEmail = data.userEmail ?? null;

          // 🎯 TARGET HIT
          if (
            targetPrice !== null &&
            newPrice <= targetPrice &&
            !data.notified
          ) {
            console.log("🎯 TARGET HIT", productId);

            if (userEmail) {
              await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: userEmail,
                subject: "🔥 Price Drop Alert!",
                html: `
                  <h2>🎯 Target reached!</h2>
                  <p>${data.productName}</p>
                  <p>Target: ₹${targetPrice}</p>
                  <p>Current: ₹${newPrice}</p>
                `,
              });
            }

            await doc.ref.update({ notified: true });
          }

          // 🔁 RESET
          if (targetPrice && newPrice > targetPrice && data.notified) {
            await doc.ref.update({ notified: false });
          }

          // 💾 SAVE HISTORY
          await historyRef.add({
            price: newPrice,
            checkedAt: admin.firestore.FieldValue.serverTimestamp(),
          });

          // ⏱ UPDATE
          await doc.ref.update({
            lastCheckedAt: admin.firestore.FieldValue.serverTimestamp(),
          });

          console.log("✅ Updated:", productId, newPrice);
        } catch (err) {
          console.error("❌ Error:", err);
        }
      }
    },
    {
      timezone: "Asia/Kolkata",
    },
  );
});
