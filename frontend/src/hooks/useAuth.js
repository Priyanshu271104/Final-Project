import { useState, useEffect } from "react";
import {
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

import { auth } from "../config/firebase";

export function useAuth() {
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return {
    currentUser,
    authLoading,
    logout,
    isAuthModalOpen,
    setIsAuthModalOpen,
    authMode,
    setAuthMode,
  };
}