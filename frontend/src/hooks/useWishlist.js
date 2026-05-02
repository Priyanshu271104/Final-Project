import { useState, useEffect } from "react";
import {
  collection,
  onSnapshot,
  doc,
  deleteDoc,
  setDoc,
  updateDoc,
  getDoc,
  increment,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../config/firebase";

export default function useWishlist(currentUser) {
  const [wishlist, setWishlist] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [wishlistError, setWishlistError] = useState("");

  // 🔁 realtime wishlist listener
  useEffect(() => {
    if (!currentUser) {
      setWishlist([]);
      return;
    }

    const wishlistRef = collection(db, "users", currentUser.uid, "wishlist");

    const unsubscribe = onSnapshot(wishlistRef, (snapshot) => {
      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setWishlist(items);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // ⚠️ NOTE: Not atomic — can be improved using transactions
  const updateQueue = async (product, change) => {
    // TODO: replace with Firestore transaction for concurrency safety

    const queueRef = doc(db, "priceCheckQueue", String(product.id));
    const queueSnap = await getDoc(queueRef);

    if (change > 0) {
      if (queueSnap.exists()) {
        await updateDoc(queueRef, {
          watchersCount: increment(1),
          isActive: true,
        });
      } else {
        await setDoc(queueRef, {
          productId: String(product.id),
          productName: product.name,
          lastCheckedAt: null,
          watchersCount: 1,
          isActive: true,
          createdAt: serverTimestamp(),
        });
      }
    } else {
      if (queueSnap.exists()) {
        const currentCount = queueSnap.data().watchersCount || 1;

        if (currentCount <= 1) {
          await updateDoc(queueRef, {
            watchersCount: 0,
            isActive: false,
          });
        } else {
          await updateDoc(queueRef, {
            watchersCount: increment(-1),
          });
        }
      }
    }
  };

  // ❤️ Add / Remove wishlist
  const toggleWishlist = async (product) => {
    if (!currentUser) return false;

    setWishlistLoading(true);
    setWishlistError("");

    const productRef = doc(
      db,
      "users",
      currentUser.uid,
      "wishlist",
      String(product.id),
    );

    const exists = wishlist.some((p) => String(p.id) === String(product.id));

    try {
      if (exists) {
        await deleteDoc(productRef);
        await updateQueue(product, -1);
      } else {
        await setDoc(productRef, {
          ...product,
          baselinePrice: product.currentPrice,
          lastCheckedPrice: product.currentPrice,
          lastNotifiedPrice: null,
          notifyEmail: true,
          addedAt: serverTimestamp(),
        });

        await updateQueue(product, 1);
      }

      return true;
    } catch (error) {
      console.error(error);
      setWishlistError("Failed to update wishlist");
      return false;
    } finally {
      setWishlistLoading(false);
    }
  };

  // 🎯 Set target price
  const setTargetPrice = async (product, targetPrice) => {
    if (!currentUser) return false;

    setWishlistLoading(true);
    setWishlistError("");

    const productRef = doc(
      db,
      "users",
      currentUser.uid,
      "wishlist",
      String(product.id),
    );

    const exists = wishlist.some((p) => String(p.id) === String(product.id));

    try {
      if (!exists) {
        await setDoc(productRef, {
          ...product,
          baselinePrice: product.currentPrice,
          lastCheckedPrice: product.currentPrice,
          lastNotifiedPrice: null,
          notifyEmail: true,
          targetPrice,
          lastTargetNotifiedPrice: null,
          addedAt: serverTimestamp(),
        });

        await updateQueue(product, 1);
      } else {
        await updateDoc(productRef, {
          targetPrice,
          lastTargetNotifiedPrice: null,
        });
      }

      return true;
    } catch (error) {
      console.error(error);
      setWishlistError("Failed to set target price");
      return false;
    } finally {
      setWishlistLoading(false);
    }
  };

  // ❌ Clear target price
  const clearTargetPrice = async (product) => {
    if (!currentUser) return false;

    setWishlistLoading(true);
    setWishlistError("");

    const productRef = doc(
      db,
      "users",
      currentUser.uid,
      "wishlist",
      String(product.id),
    );

    try {
      await updateDoc(productRef, {
        targetPrice: null,
        lastTargetNotifiedPrice: null,
      });

      return true;
    } catch (error) {
      console.error(error);
      setWishlistError("Failed to clear target price");
      return false;
    } finally {
      setWishlistLoading(false);
    }
  };

  return {
  wishlist,
  wishlistLoading,
  wishlistError,
  setWishlistError, // ✅ ADD THIS
  toggleWishlist,
  setTargetPrice,
  clearTargetPrice,
};
}
