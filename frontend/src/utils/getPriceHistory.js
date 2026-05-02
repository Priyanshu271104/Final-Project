import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../config/firebase";

export async function getPriceHistory(productId) {
  const ref = collection(
    db,
    "priceHistory",
    String(productId),
    "daily"
  );

  const q = query(ref, orderBy("__name__")); // sorted by date
  const snapshot = await getDocs(q);

  const history = snapshot.docs.map((doc) => ({
    date: doc.id,
    price: doc.data().price,
  }));

  return history;
}