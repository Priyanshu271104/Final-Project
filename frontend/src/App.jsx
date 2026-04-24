import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, onSnapshot, doc, deleteDoc, setDoc, updateDoc } from 'firebase/firestore';

// 1. Import Firebase Config
import { auth, db } from './config/firebase';

// 2. Import All Modular Components
import Header from './components/Header';
import Hero from './components/Hero';
import Results from './components/Results';
import ProductDetails from './components/ProductDetails';
import WishlistView from './components/WishlistView';
import AuthModal from './components/AuthModal';

export default function App() {
  // --- STATE MANAGEMENT ---
  const [view, setView] = useState('home'); // 'home' | 'results' | 'details' | 'wishlist'
  const [previousView, setPreviousView] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // Auth & User State
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'signup'
  
  // Data State
  const [wishlist, setWishlist] = useState([]);

  // --- EFFECTS ---

  // Listen for Authentication State Changes
  useEffect(() => { 
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe(); 
  }, []);

  // Listen for Wishlist Updates in Real-time (Firestore)
  useEffect(() => {
    if (!currentUser) {
      setWishlist([]); // Clear wishlist if logged out
      return;
    }

    const wishlistRef = collection(db, 'users', currentUser.uid, 'wishlist');
    const unsubscribe = onSnapshot(wishlistRef, (snapshot) => {
      const items = snapshot.docs.map(doc => doc.data());
      setWishlist(items);
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, [currentUser]);

  // --- HANDLERS ---

  const handleSearch = (query) => { 
    setSearchQuery(query); 
    setView('results'); 
  };

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setPreviousView(view);
    setView('details');
  };

  const handleToggleWishlist = async (product) => {
    // Require login to use wishlist
    if (!currentUser) {
      setAuthMode('login');
      setIsAuthModalOpen(true);
      return;
    }

    const productRef = doc(db, 'users', currentUser.uid, 'wishlist', String(product.id));
    const exists = wishlist.some(p => String(p.id) === String(product.id));

    try {
      if (exists) {
        await deleteDoc(productRef);
      } else {
        await setDoc(productRef, {
          ...product,
          baselinePrice: product.currentPrice,
          lastCheckedPrice: product.currentPrice,
          lastNotifiedPrice: null,
          notifyEmail: true,
          addedAt: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.error("Error updating wishlist:", err);
    }
  };

  const handleSetTargetPrice = async (product, targetPrice) => {
    if (!currentUser) {
      setAuthMode('login');
      setIsAuthModalOpen(true);
      return;
    }

    const productRef = doc(db, 'users', currentUser.uid, 'wishlist', String(product.id));
    const exists = wishlist.some(p => String(p.id) === String(product.id));

    try {
      if (!exists) {
        // Auto-wishlist so the cron will pick it up
        await setDoc(productRef, {
          ...product,
          baselinePrice: product.currentPrice,
          lastCheckedPrice: product.currentPrice,
          lastNotifiedPrice: null,
          notifyEmail: true,
          targetPrice,
          lastTargetNotifiedPrice: null,
          addedAt: new Date().toISOString(),
        });
      } else {
        // Reset lastTargetNotifiedPrice so the new target starts fresh
        await updateDoc(productRef, { targetPrice, lastTargetNotifiedPrice: null });
      }
    } catch (err) {
      console.error("Error setting target price:", err);
    }
  };

  const handleClearTargetPrice = async (product) => {
    if (!currentUser) return;
    const productRef = doc(db, 'users', currentUser.uid, 'wishlist', String(product.id));
    try {
      await updateDoc(productRef, { targetPrice: null, lastTargetNotifiedPrice: null });
    } catch (err) {
      console.error("Error clearing target price:", err);
    }
  };

  // --- RENDER ---
  return (
    <div className="font-sans antialiased bg-slate-50 min-h-screen text-slate-900">
      
      {/* Global Header */}
      <Header 
        setView={setView} 
        user={currentUser} 
        onAuthRequest={(mode) => { setAuthMode(mode); setIsAuthModalOpen(true); }} 
        onLogout={() => signOut(auth)} 
        onWishlistClick={() => setView('wishlist')}
        view={view}
      />
      
      {/* View Routing */}
      {view === 'home' && (
        <Hero onSearch={handleSearch} />
      )}
      
      {view === 'results' && (
        <Results 
          query={searchQuery} 
          onBack={() => setView('home')} 
          onSelectProduct={handleSelectProduct} 
        />
      )}
      
      {view === 'details' && selectedProduct && (
        <ProductDetails
          product={selectedProduct}
          onBack={() => setView(previousView)}
          user={currentUser}
          onAuthRequest={(mode) => { setAuthMode(mode); setIsAuthModalOpen(true); }}
          wishlist={wishlist}
          onToggleWishlist={handleToggleWishlist}
          onSetTargetPrice={handleSetTargetPrice}
          onClearTargetPrice={handleClearTargetPrice}
        />
      )}

      {view === 'wishlist' && (
        <WishlistView 
          wishlist={wishlist} 
          onBack={() => setView('home')} 
          onSelectProduct={handleSelectProduct}
          onRemove={handleToggleWishlist}
        />
      )}
      
      {/* Global Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        initialMode={authMode} 
      />
      
    </div>
  );
}