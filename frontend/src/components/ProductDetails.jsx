import React, { useState, useEffect } from "react";
import { getPriceHistory } from "../utils/getPriceHistory";
import { trackProduct } from "../utils/trackProduct";
import {
  ArrowLeft,
  Heart,
  ShieldCheck,
  Clock,
  Star,
  TrendingDown,
  Truck,
  ExternalLink,
  TrendingUp,
  Target,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

// Import the helper function to generate competitor prices
import SetPriceModal from "./SetPriceModal";
const generateFallbackHistory = (price) => {
  if (!price) return [];

  return [
    { date: "Jan", price: price * 1.08 },
    { date: "Feb", price: price * 1.05 },
    { date: "Mar", price: price * 1.03 },
    { date: "Apr", price: price * 1.01 },
    { date: "Now", price: price },
  ];
};

const ProductDetails = ({
  product,
  onBack,
  user,
  onAuthRequest,
  wishlist,
  onToggleWishlist,
  onSetTargetPrice,
  onClearTargetPrice,
}) => {
  const sortedStores = React.useMemo(() => {
  return [...(product.stores || [])].sort(
    (a, b) => (a.price || 0) - (b.price || 0)
  );
}, [product.stores]);
  // 1. Enrich the raw product data with simulated competitor prices (Amazon vs Flipkart etc.)
  const validPrices = sortedStores.map((s) => s.price).filter((p) => p > 0);
  const handleWishlist = async (product) => {
  const alreadyWishlisted = wishlist.some(
    (item) => String(item.id) === String(product.id)
  );

  onToggleWishlist(product);

  // 🔥 Only track when ADDING (not removing)
  if (!alreadyWishlisted) {
    try {
      await trackProduct(product);
    } catch (e) {
      console.error("Tracking failed", e);
    }
  }
};
  const bestPrice =
    validPrices.length > 0
      ? Math.min(...validPrices)
      : product.currentPrice || 0;

  // 3. Check if this product is already in the user's wishlist
  const wishlistEntry = (wishlist || []).find(
  (item) => String(item.id) === String(product.id)
);
  const isWishlisted = Boolean(wishlistEntry);
  const currentTarget = wishlistEntry?.targetPrice ?? null;
  const [history, setHistory] = useState([]);

  const displayHistory =
    history.length > 0
      ? history
      : generateFallbackHistory(product.currentPrice || 0);
  useEffect(() => {
    if (!product?.id) return;

    async function fetchHistory() {
      try {
        const data = await getPriceHistory(product.id);
        setHistory(data);
      } catch (error) {
        console.error("Failed to load history", error);
      }
    }

    fetchHistory();
  }, [product?.id]);

  const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);
  if (!product) return null;

  const handleOpenPriceModal = () => {
    if (!user) {
      onAuthRequest("login");
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
                onClick={() => handleWishlist(product)}
                className={`flex items-center justify-center p-4 rounded-xl border shadow-sm transition-all group ${
                  isWishlisted
                    ? "bg-pink-50 border-pink-200 text-pink-600"
                    : "bg-white border-slate-200 text-slate-700 hover:border-pink-200 hover:bg-pink-50"
                }`}
              >
                <Heart
                  className={`w-6 h-6 mr-2 transition-all ${isWishlisted ? "fill-pink-500 text-pink-500" : "text-slate-400 group-hover:text-pink-500"}`}
                />
                <span className="font-bold">
                  {isWishlisted ? "Wishlisted" : "Add to Wishlist"}
                </span>
              </button>

              <button
                onClick={handleOpenPriceModal}
                className={`flex items-center justify-center p-4 rounded-xl border shadow-sm transition-all group ${
                  currentTarget != null
                    ? "bg-blue-50 border-blue-200 text-blue-700"
                    : "bg-white border-slate-200 text-slate-700 hover:border-blue-200 hover:bg-blue-50"
                }`}
              >
                <Target
                  className={`w-6 h-6 mr-2 transition-all ${currentTarget != null ? "text-blue-600" : "text-slate-400 group-hover:text-blue-500"}`}
                />
                <span className="font-bold">
                  {currentTarget != null
                    ? `Target: ₹${currentTarget.toLocaleString("en-IN")}`
                    : "Set Price"}
                </span>
              </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
                <ShieldCheck className="w-6 h-6 text-green-500 mx-auto mb-2" />
                <p className="text-xs text-slate-500 uppercase font-bold">
                  Verified
                </p>
                <p className="text-sm font-semibold text-slate-900">
                  Authentic Seller
                </p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
                <Clock className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                <p className="text-xs text-slate-500 uppercase font-bold">
                  Update
                </p>
                <p className="text-sm font-semibold text-slate-900">
                  Real-time
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Info, Comparison & Graph */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title & Best Price Header */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
                    {product.name}
                  </h1>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-semibold">
                      {product.category || "Electronics"}
                    </span>
                    <div className="flex items-center text-yellow-500">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="ml-1 font-medium text-slate-700">
                        {product.rating || 4.5} ({product.reviews || 0} reviews)
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-500 mb-1">Best Price</p>
                  <p className="text-4xl font-bold text-slate-900">
                    {bestPrice > 0
                      ? `₹${bestPrice.toLocaleString("en-IN")}`
                      : "Price unavailable"}
                  </p>
                </div>
              </div>
            </div>

            {/* Price Comparison Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-green-600" /> Price
                  Comparison
                </h3>
              </div>
              <div className="divide-y divide-slate-100">
                {sortedStores.map((store, idx) => (
                  <div
                    key={idx}
                    className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      {/* Store Logo Circle */}
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center bg-slate-100 text-xs font-bold ${store.color || "text-slate-600"} border border-slate-200`}
                      >
                        {store.logo || store.name.substring(0, 2)}
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
                        <p
                          className={`text-xl font-bold ${idx === 0 ? "text-green-600" : "text-slate-900"}`}
                        >
                          ₹{store.price.toLocaleString("en-IN")}
                        </p>
                        {store.price === bestPrice && (
                          <p className="text-[10px] text-white bg-green-500 px-2 py-0.5 rounded-full inline-block">
                            Lowest Price
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() =>
                          store.link && window.open(store.link, "_blank")
                        }
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
              {history.length === 0 && (
                <p className="text-sm text-blue-500 mb-4">
                  📊 Showing estimated trend. Tracking started.
                </p>
              )}

              <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" /> Price History
                (3 Months)
              </h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={displayHistory}>
                    <defs>
                      <linearGradient
                        id="colorHistory"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#2563eb"
                          stopOpacity={0.1}
                        />
                        <stop
                          offset="95%"
                          stopColor="#2563eb"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#e2e8f0"
                    />
                    <XAxis
                      dataKey="date"
                      stroke="#94a3b8"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#94a3b8"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(val) => `₹${val / 1000}k`}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "12px",
                        border: "none",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                      itemStyle={{ color: "#2563eb", fontWeight: "bold" }}
                      formatter={(value) => [
                        value ? `₹${value.toLocaleString()}` : "N/A",
                        "Price",
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="price"
                      stroke="#2563eb"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorHistory)"
                    />
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
        history={history}
      />
    </div>
  );
};

export default ProductDetails;
