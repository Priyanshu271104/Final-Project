import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../../frontend/src/config/firebase";

export async function getPriceHistory(productId) {
  try {
    const ref = collection(
      db,
      "priceHistory",
      String(productId),
      "daily"
    );

    const q = query(ref, orderBy("__name__"));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      date: doc.id,
      price: doc.data()?.price || 0,
    }));
  } catch (error) {
    console.error("History fetch failed:", error);
    return [];
  }
}