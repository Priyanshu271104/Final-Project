import React, { useState, useEffect } from "react";
import { useAuth } from "./hooks/useAuth";
import useWishlist from "./hooks/useWishlist";

import Header from "./components/Header";
import Hero from "./components/Hero";
import Results from "./components/Results";
import ProductDetails from "./components/ProductDetails";
import WishlistView from "./components/WishlistView";
import AuthModal from "./components/AuthModal";

export default function App() {
  const [view, setView] = useState("home");
  const [previousView, setPreviousView] = useState("home");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);

  const { currentUser, authLoading, logout } = useAuth();

  const {
    wishlist,
    wishlistLoading,
    wishlistError,
    setWishlistError, // ✅ added
    toggleWishlist,
    setTargetPrice,
    clearTargetPrice,
  } = useWishlist(currentUser);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");

  // 🔥 auto-hide wishlist error
  useEffect(() => {
    if (!wishlistError) return;

    const timer = setTimeout(() => {
      setWishlistError("");
    }, 3000);

    return () => clearTimeout(timer);
  }, [wishlistError, setWishlistError]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    setView("results");
  };

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setPreviousView(view);
    setView("details");
  };

  const requireLogin = (mode = "login") => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 mt-4 font-medium">Loading...</p>
      </div>
    );
  }

  return (
    <div className="font-sans antialiased bg-slate-50 min-h-screen text-slate-900">
      
      {/* ❌ Error banner */}
      {wishlistError && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[999] bg-red-50 border border-red-200 text-red-700 px-6 py-3 rounded-xl shadow-lg">
          {wishlistError}
        </div>
      )}

      {/* 🔄 Loading indicator */}
      {wishlistLoading && (
        <div className="fixed top-20 right-6 z-[999] bg-white border border-slate-200 px-4 py-2 rounded-lg shadow-md text-sm font-medium text-slate-700">
          Updating wishlist...
        </div>
      )}

      <Header
        setView={setView}
        user={currentUser}
        onAuthRequest={requireLogin}
        onLogout={logout}
        onWishlistClick={() => setView("wishlist")}
        view={view}
      />

      {view === "home" && <Hero onSearch={handleSearch} />}

      {view === "results" && (
        <Results
          query={searchQuery}
          onBack={() => setView("home")}
          onSelectProduct={handleSelectProduct}
        />
      )}

      {view === "details" && selectedProduct && (
        <ProductDetails
          product={selectedProduct}
          onBack={() => setView(previousView)}
          user={currentUser}
          onAuthRequest={requireLogin}
          wishlist={wishlist}
          onToggleWishlist={async (product) => {
            if (!currentUser) {
              requireLogin();
              return;
            }
            await toggleWishlist(product);
          }}
          onSetTargetPrice={async (product, price) => {
            if (!currentUser) {
              requireLogin();
              return;
            }
            await setTargetPrice(product, price);
          }}
          onClearTargetPrice={clearTargetPrice}
        />
      )}

      {view === "wishlist" && (
        <WishlistView
          wishlist={wishlist}
          onBack={() => setView("home")}
          onSelectProduct={handleSelectProduct}
          onRemove={toggleWishlist}
        />
      )}

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authMode}
      />
    </div>
  );
}