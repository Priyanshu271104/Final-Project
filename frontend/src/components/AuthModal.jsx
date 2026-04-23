import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  updateProfile 
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase'; // Importing from your new config folder

const AuthModal = ({ isOpen, onClose, initialMode = 'login' }) => {
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const MIN_PASSWORD_LENGTH = 8;

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setError('');
      setEmail('');
      setPassword('');
      setName('');
    }
  }, [isOpen, initialMode]);

  const friendlyAuthError = (code, currentMode) => {
    switch (code) {
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/weak-password':
        return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
      case 'auth/email-already-in-use':
        return currentMode === 'signup'
          ? 'Unable to create account. Please try a different email or sign in.'
          : 'Invalid email or password.';
      case 'auth/too-many-requests':
        return 'Too many attempts. Please try again later.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection and try again.';
      default:
        return currentMode === 'signup'
          ? 'Unable to create account. Please try again.'
          : 'Invalid email or password.';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (mode === 'signup') {
      if (name.trim().length === 0 || name.length > 100) {
        setError('Please enter a valid name.');
        return;
      }
      if (password.length < MIN_PASSWORD_LENGTH) {
        setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
        return;
      }
    }

    setLoading(true);
    try {
      if (mode === 'signup') {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await updateProfile(user, { displayName: name });

        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          displayName: name,
          createdAt: serverTimestamp(),
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }

      onClose();
    } catch (err) {
      console.error(err);
      setError(friendlyAuthError(err.code, mode));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
        onClick={onClose} 
      />
      
      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-slate-50 px-8 py-6 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-900">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5 text-slate-400 hover:text-slate-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-4">
          
          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}

          {/* Name Field (Signup Only) */}
          {mode === 'signup' && (
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Full Name</label>
              <input 
                type="text" 
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
                placeholder="John Doe"
                value={name} 
                onChange={e => setName(e.target.value)} 
                required 
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Email Address</label>
            <input 
              type="email" 
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
              placeholder="name@example.com"
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Password</label>
            <input
              type="password"
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              minLength={mode === 'signup' ? MIN_PASSWORD_LENGTH : undefined}
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              required
            />
            {mode === 'signup' && (
              <p className="text-xs text-slate-500">At least {MIN_PASSWORD_LENGTH} characters.</p>
            )}
          </div>

          <button 
            type="submit"
            disabled={loading} 
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg mt-4 flex justify-center items-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-blue-600/20"
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : (mode === 'login' ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        {/* Footer Toggle */}
        <div className="bg-slate-50 px-8 py-4 border-t border-slate-100 text-center text-sm text-slate-600">
            {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
           <button 
             onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} 
             className="text-blue-600 font-bold hover:underline"
           >
             {mode === 'login' ? 'Sign Up' : 'Log In'}
           </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;