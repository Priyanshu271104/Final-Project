import React from "react";
import { Star, ArrowRight } from "lucide-react";

const ProductCard = ({ product, onSelect }) => {
  // Logic: Find the lowest price among all available stores
  // If no specific stores are listed, fall back to the main 'currentPrice'
if (!product) return null;

  const rating = product.rating || 0;
  const sortedStores = [...((product && product.stores) || [])].sort(
    (a, b) => (a.price || 0) - (b.price || 0),
  );
  const validPrices = sortedStores
    .map((s) => s?.price || 0)
    .filter((p) => p > 0);
  const bestPrice =
    validPrices.length > 0
      ? Math.min(...validPrices)
      : product.currentPrice || 0;
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all duration-300 group">
      <div className="flex flex-col md:flex-row">
        {/* Image Section */}
        <div className="p-6 md:w-1/3 flex items-center justify-center border-b md:border-b-0 md:border-r border-slate-100 bg-white">
          {product.image ? (
            <img
              src={product.image}
              className="max-h-48 object-contain group-hover:scale-105 transition-transform duration-500"
              alt={product.name}
            />
          ) : (
            <div className="text-6xl text-slate-300">📱</div>
          )}
        </div>

        {/* Details Section */}
        <div className="p-6 md:w-2/3 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2">
              {product.name}
            </h3>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < Math.floor(rating) ? "fill-current" : "text-slate-300"}`}
                  />
                ))}
              </div>
              <span className="text-xs text-slate-500 font-medium">
                ({product.reviews || 0} reviews)
              </span>
            </div>
          </div>

          {/* Price & Action */}
          <div className="flex items-end justify-between mt-4">
            <div>
              <p className="text-sm text-slate-500 mb-1">Best Price</p>
              <p className="text-3xl font-bold text-slate-900">
                {bestPrice > 0
                  ? `₹${bestPrice.toLocaleString("en-IN")}`
                  : "Price unavailable"}
              </p>
            </div>

            <button
              onClick={() => onSelect && onSelect(product)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2"
            >
              Compare Prices <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
