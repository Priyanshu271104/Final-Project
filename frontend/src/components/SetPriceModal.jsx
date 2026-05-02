/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect } from "react";
import { X, Target } from "lucide-react";

const SetPriceModal = ({
  isOpen,
  onClose,
  product,
  currentTarget,
  onSave,
  onClear,
  history = [],
}) => {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setValue(currentTarget ? String(currentTarget) : "");
      setError("");
    }
  }, [isOpen, currentTarget]);

  if (!isOpen || !product) return null;

  const currentPrice = product.currentPrice || 0;

  const historyPrices = (history || []).map((h) => h.price).filter(Boolean);
  const lowestSeen = historyPrices.length ? Math.min(...historyPrices) : null;

  const suggestedPrice =
  lowestSeen && lowestSeen > 0
    ? Math.floor(lowestSeen * 0.95)
    : currentPrice > 0
    ? Math.floor(currentPrice * 0.9)
    : 0;

  const handleSubmit = (e) => {
    e.preventDefault();

    const n = parseInt(value, 10);

    if (!Number.isFinite(n) || n <= 0) {
      setError("Enter a valid price");
      return;
    }

    if (n >= currentPrice) {
      setError(
        `Target must be LOWER than current price (₹${currentPrice.toLocaleString(
          "en-IN",
        )})`,
      );
      return;
    }

    onSave(n);
    onClose();
  };

  const handleClear = () => {
    onClear();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex items-start justify-between mb-5">
<div className="flex items-center gap-2">            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
              <Target className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Set Target Price</h2>
              <p className="text-xs text-slate-500">
                We'll email you when it hits this price
              </p>
            </div>
          </div>

          <button onClick={onClose}>
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* PRODUCT NAME */}
        <p className="text-sm mb-4 font-medium">{product.name}</p>

        {/* PRICE INFO */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-slate-50 p-3 rounded-xl">
            <p className="text-xs text-slate-500">Current</p>
            <p className="text-lg font-bold">
              {currentPrice > 0
                ? `₹${currentPrice.toLocaleString("en-IN")}`
                : "N/A"}{" "}
            </p>
          </div>

          {lowestSeen != null && (
            <div className="bg-slate-50 p-3 rounded-xl">
              <p className="text-xs text-slate-500">Lowest seen</p>
              <p className="text-lg font-bold text-green-600">
                ₹{lowestSeen.toLocaleString("en-IN")}
              </p>
            </div>
          )}
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit}>
          <label className="block text-sm mb-2 font-semibold">
            Your target price (₹)
          </label>

          <input
            type="number"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setError("");
            }}
            className="w-full px-4 py-3 border rounded-xl"
          />

          {/* 🔥 SUGGEST BUTTON (NOW CORRECT PLACE) */}
          <button
            type="button"
            onClick={() => setValue(String(suggestedPrice))}
            className="text-xs text-blue-600 underline mt-2"
          >
            Suggest ₹{suggestedPrice.toLocaleString("en-IN")}
          </button>

          {error && <p className="text-red-600 mt-2 text-sm">{error}</p>}

          <div className="flex gap-3 mt-5">
            {currentTarget != null && (
              <button
                type="button"
                onClick={handleClear}
                className="px-4 py-2 border rounded-xl"
              >
                Clear
              </button>
            )}

            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 rounded-xl"
            >
              {currentTarget != null ? "Update" : "Set Target"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SetPriceModal;
