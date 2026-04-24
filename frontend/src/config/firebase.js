import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBJ_41STHuYgDZ8XBJrWxHfwiuJs1Qt4Mk",
  authDomain: "pricelens-b802e.firebaseapp.com",
  projectId: "pricelens-b802e",
  storageBucket: "pricelens-b802e.firebasestorage.app",
  messagingSenderId: "668292203944",
  appId: "1:668292203944:web:ea1e31e097bbb6a693c99d"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);