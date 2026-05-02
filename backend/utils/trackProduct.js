import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../frontend/src/config/firebase";

export const trackProduct = async (product) => {
  if (!product?.id) return;

  const ref = doc(db, "priceCheckQueue", String(product.id));
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    // 🔥 first time tracking
    await setDoc(ref, {
      productId: String(product.id),
      productName: product.name || "Unknown",

      userEmail: product.userEmail || null, // ✅ NEW
      targetPrice: product.targetPrice || null, // ✅ NEW

      watchersCount: 1,
      isActive: true,
      lastCheckedAt: null,
      createdAt: serverTimestamp(),
    });
  } else {
    // 🔥 already exists → update user + increment
    await updateDoc(ref, {
      watchersCount: increment(1),
      isActive: true,

      userEmail: product.userEmail || null, // ✅ UPDATE
      targetPrice: product.targetPrice || null, // ✅ UPDATE
    });
  }
};