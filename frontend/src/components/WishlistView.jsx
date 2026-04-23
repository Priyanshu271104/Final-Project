import React from 'react';
import { ArrowLeft, Heart, X, ExternalLink } from 'lucide-react';

const WishlistView = ({ wishlist, onBack, onSelectProduct, onRemove }) => {
  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="max-w-6xl mx-auto px-4">
        
        {/* Header Section */}
        <button 
          onClick={onBack} 
          className="flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-6 font-medium transition-colors w-fit"
        >
          <ArrowLeft className="w-5 h-5" /> Back to Home
        </button>

        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-pink-100 rounded-full">
            <Heart className="w-6 h-6 text-pink-600 fill-pink-600" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900">My Wishlist</h2>
          <span className="bg-slate-200 text-slate-600 px-3 py-1 rounded-full text-sm font-bold">
            {wishlist.length} Items
          </span>
        </div>
        
        {/* Empty State Logic */}
        {wishlist.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300 shadow-sm">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Your wishlist is empty</h3>
            <p className="text-slate-500 mt-2 max-w-md mx-auto">
              Start tracking prices by searching for products and clicking the heart icon.
            </p>
            <button 
              onClick={onBack}
              className="mt-8 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20"
            >
              Start Searching
            </button>
          </div>
        ) : (
          /* Grid of Wishlist Items */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlist.map(product => (
              <div 
                key={product.id} 
                className="group bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative"
              >
                {/* Remove Button (Absolute Position) */}
                <button 
                  onClick={(e) => { 
                    e.stopPropagation(); // Prevents clicking the card itself
                    onRemove(product); 
                  }}
                  className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all z-20 border border-slate-100"
                  title="Remove from wishlist"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Product Image */}
                <div 
                  className="p-8 border-b border-slate-100 flex justify-center h-56 items-center bg-white cursor-pointer"
                  onClick={() => onSelectProduct(product)}
                >
                  {product.image ? (
                    <img 
                      src={product.image} 
                      className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500" 
                      alt={product.name} 
                    />
                  ) : (
                    <div className="text-6xl">📱</div>
                  )}
                </div>

                {/* Card Content */}
                <div className="p-5">
                  <h3 
                    className="font-bold text-slate-900 line-clamp-2 h-12 mb-3 cursor-pointer hover:text-blue-600 transition-colors"
                    onClick={() => onSelectProduct(product)}
                  >
                    {product.name}
                  </h3>
                  
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Current Price</p>
                      <p className="text-2xl font-bold text-slate-900">
                        ₹{product.currentPrice.toLocaleString('en-IN')}
                      </p>
                    </div>
                    
                    <button 
                      onClick={() => onSelectProduct(product)}
                      className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-1"
                    >
                      View <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistView;