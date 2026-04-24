import React, { useState } from 'react';
import {
  ArrowLeft, Heart, ShieldCheck, Clock, Star,
  TrendingDown, Truck, ExternalLink, TrendingUp, Target
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip
} from 'recharts';

// Import the helper function to generate competitor prices
import { enrichProductWithCompetitors } from '../utils/helpers';
import SetPriceModal from './SetPriceModal';

const ProductDetails = ({
  product, onBack, user, onAuthRequest,
  wishlist, onToggleWishlist,
  onSetTargetPrice, onClearTargetPrice,
}) => {

  // 1. Enrich the raw product data with simulated competitor prices (Amazon vs Flipkart etc.)
  const enrichedProduct = enrichProductWithCompetitors(product);

  // 2. Calculate the absolute lowest price to display prominently
  const bestPrice = enrichedProduct.stores && enrichedProduct.stores.length > 0
    ? Math.min(...enrichedProduct.stores.map(s => s.price))
    : enrichedProduct.currentPrice;

  // 3. Check if this product is already in the user's wishlist
  const wishlistEntry = wishlist.find(item => String(item.id) === String(product.id));
  const isWishlisted = Boolean(wishlistEntry);
  const currentTarget = wishlistEntry?.targetPrice ?? null;

  const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);

  const handleOpenPriceModal = () => {
    if (!user) {
      onAuthRequest('login');
      return;
    }
    setIsPriceModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        
        {/* Back Button */}
        <button 
          onClick={onBack} 
          className="flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-6 transition-colors font-medium"
        >
          <ArrowLeft className="w-5 h-5" /> Back to Results
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: Image & Actions */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm flex items-center justify-center min-h-[300px]">
              {product.image ? (
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="max-w-full max-h-[300px] object-contain hover:scale-105 transition-transform duration-500" 
                />
              ) : (
                <div className="text-8xl">📱</div>
              )}
            </div>
            
            {/* Wishlist + Set Price Buttons */}
            <div className="grid grid-cols-1 gap-4">
               <button
                 onClick={() => onToggleWishlist(product)}
                 className={`flex items-center justify-center p-4 rounded-xl border shadow-sm transition-all group ${
                   isWishlisted
                     ? 'bg-pink-50 border-pink-200 text-pink-600'
                     : 'bg-white border-slate-200 text-slate-700 hover:border-pink-200 hover:bg-pink-50'
                 }`}
               >
                 <Heart className={`w-6 h-6 mr-2 transition-all ${isWishlisted ? 'fill-pink-500 text-pink-500' : 'text-slate-400 group-hover:text-pink-500'}`} />
                 <span className="font-bold">{isWishlisted ? 'Wishlisted' : 'Add to Wishlist'}</span>
               </button>

               <button
                 onClick={handleOpenPriceModal}
                 className={`flex items-center justify-center p-4 rounded-xl border shadow-sm transition-all group ${
                   currentTarget != null
                     ? 'bg-blue-50 border-blue-200 text-blue-700'
                     : 'bg-white border-slate-200 text-slate-700 hover:border-blue-200 hover:bg-blue-50'
                 }`}
               >
                 <Target className={`w-6 h-6 mr-2 transition-all ${currentTarget != null ? 'text-blue-600' : 'text-slate-400 group-hover:text-blue-500'}`} />
                 <span className="font-bold">
                   {currentTarget != null
                     ? `Target: ₹${currentTarget.toLocaleString('en-IN')}`
                     : 'Set Price'}
                 </span>
               </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
                <ShieldCheck className="w-6 h-6 text-green-500 mx-auto mb-2" />
                <p className="text-xs text-slate-500 uppercase font-bold">Verified</p>
                <p className="text-sm font-semibold text-slate-900">Authentic Seller</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
                <Clock className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                <p className="text-xs text-slate-500 uppercase font-bold">Update</p>
                <p className="text-sm font-semibold text-slate-900">Real-time</p>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Info, Comparison & Graph */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Title & Best Price Header */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">{product.name}</h1>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-semibold">{product.category || 'Electronics'}</span>
                    <div className="flex items-center text-yellow-500">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="ml-1 font-medium text-slate-700">{product.rating || 4.5} ({product.reviews || 0} reviews)</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-500 mb-1">Best Price</p>
                  <p className="text-4xl font-bold text-slate-900">₹{bestPrice.toLocaleString('en-IN')}</p>
                </div>
              </div>
            </div>

            {/* Price Comparison Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-green-600" /> Price Comparison
                </h3>
              </div>
              <div className="divide-y divide-slate-100">
                {enrichedProduct.stores.map((store, idx) => (
                  <div key={idx} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                      {/* Store Logo Circle */}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-slate-100 text-xs font-bold ${store.color || 'text-slate-600'} border border-slate-200`}>
                        {store.logo || store.name.substring(0,2)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{store.name}</p>
                        <p className="text-xs text-green-600 flex items-center gap-1">
                          <Truck className="w-3 h-3" /> Free Delivery
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-6">
                      <div>
                        <p className={`text-xl font-bold ${idx === 0 ? 'text-green-600' : 'text-slate-900'}`}>
                          ₹{store.price.toLocaleString('en-IN')}
                        </p>
                        {idx === 0 && <p className="text-[10px] text-white bg-green-500 px-2 py-0.5 rounded-full inline-block">Lowest Price</p>}
                      </div>
                      <button 
                        onClick={() => window.open(store.link, '_blank')}
                        className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                      >
                        Buy <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Price History Graph */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" /> Price History (3 Months)
              </h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={product.history || []}>
                    <defs>
                      <linearGradient id="colorHistory" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val/1000}k`} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                      itemStyle={{ color: '#2563eb', fontWeight: 'bold' }} 
                      formatter={(value) => [`₹${value.toLocaleString()}`, 'Price']} 
                    />
                    <Area type="monotone" dataKey="price" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorHistory)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        </div>
      </div>

      <SetPriceModal
        isOpen={isPriceModalOpen}
        onClose={() => setIsPriceModalOpen(false)}
        product={product}
        currentTarget={currentTarget}
        onSave={(price) => onSetTargetPrice(product, price)}
        onClear={() => onClearTargetPrice(product)}
      />
    </div>
  );
};

export default ProductDetails;