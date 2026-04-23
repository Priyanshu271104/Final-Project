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

  useEffect(() => {
    if (!currentUser) {
      setWishlist([]);
      return;
    }

    const wishlistRef = collection(db, "users", currentUser.uid, "wishlist");

    const unsubscribe = onSnapshot(wishlistRef, (snapshot) => {
      const items = snapshot.docs.map((doc) => doc.data());
      setWishlist(items);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const updateQueue = async (product, change) => {
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

  const toggleWishlist = async (product) => {
    setWishlistLoading(true);
    setWishlistError("");
if (!currentUser) {
  setWishlistLoading(false);
  return false;
}
    const productRef = doc(
      db,
      "users",
      currentUser.uid,
      "wishlist",
      String(product.id),
    );

    const exists = wishlist.some((p) => String(p.id) === String(product.id));

    try{if (exists) {
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
    }}
    catch (error) {
   console.error(error);

   setWishlistError(
     "Failed to update wishlist"
   );

   setWishlistLoading(false);
   return false;
}
    setWishlistLoading(false);

    return true;
  };

  const setTargetPrice = async (product, targetPrice) => {
    setWishlistLoading(true);
setWishlistError("");
if (!currentUser) {
  setWishlistLoading(false);
  return false;
}
    const productRef = doc(
      db,
      "users",
      currentUser.uid,
      "wishlist",
      String(product.id),
    );

    const exists = wishlist.some((p) => String(p.id) === String(product.id));

    try{if (!exists) {
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
    }}catch(error) {
  console.error(error);

  setWishlistError(
    "Failed to set target price"
  );

  setWishlistLoading(false);
  return false;
}setWishlistLoading(false);

    return true;
  };

  const clearTargetPrice = async (product) => {
  setWishlistLoading(true);
  setWishlistError("");

  if (!currentUser) {
    setWishlistLoading(false);
    return false;
  }

  const productRef = doc(
    db,
    "users",
    currentUser.uid,
    "wishlist",
    String(product.id)
  );

  try {
    await updateDoc(productRef, {
      targetPrice: null,
      lastTargetNotifiedPrice: null,
    });

    setWishlistLoading(false);
    return true;
  } catch (error) {
    console.error(error);

    setWishlistError(
      "Failed to clear target price"
    );

    setWishlistLoading(false);
    return false;
  }
};
return {
  wishlist,
  wishlistLoading,
  wishlistError,
  toggleWishlist,
  setTargetPrice,
  clearTargetPrice,
};
}
