import React, { useState, useEffect } from 'react';
import { X, Target } from 'lucide-react';

const SetPriceModal = ({ isOpen, onClose, product, currentTarget, onSave, onClear }) => {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setValue(currentTarget ? String(currentTarget) : '');
      setError('');
    }
  }, [isOpen, currentTarget]);

  if (!isOpen || !product) return null;

  const currentPrice = product.currentPrice;
  const historyPrices = (product.history || []).map(h => h.price).filter(Boolean);
  const lowestSeen = historyPrices.length ? Math.min(...historyPrices) : null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const n = parseInt(value, 10);
    if (!Number.isFinite(n) || n <= 0) {
      setError('Enter a valid price');
      return;
    }
    if (n >= currentPrice) {
      setError(`Target should be below the current price (₹${currentPrice.toLocaleString('en-IN')})`);
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
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
              <Target className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Set Target Price</h2>
              <p className="text-xs text-slate-500">We'll email you when it hits this price</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <p className="text-sm text-slate-700 mb-4 line-clamp-2 font-medium">{product.name}</p>

        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
            <p className="text-[10px] text-slate-500 uppercase font-bold mb-1 tracking-wide">Current</p>
            <p className="text-lg font-bold text-slate-900">₹{currentPrice.toLocaleString('en-IN')}</p>
          </div>
          {lowestSeen != null && (
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
              <p className="text-[10px] text-slate-500 uppercase font-bold mb-1 tracking-wide">Lowest seen</p>
              <p className="text-lg font-bold text-green-600">₹{lowestSeen.toLocaleString('en-IN')}</p>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Your target price (₹)
          </label>
          <input
            type="number"
            inputMode="numeric"
            min="1"
            step="1"
            value={value}
            onChange={(e) => { setValue(e.target.value); setError(''); }}
            placeholder="e.g. 45000"
            autoFocus
            className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-lg font-bold text-slate-900"
          />
          {error && <p className="text-sm text-red-600 mt-2">{error}</p>}

          <div className="flex gap-3 mt-5">
            {currentTarget != null && (
              <button
                type="button"
                onClick={handleClear}
                className="px-4 py-3 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
              >
                Clear
              </button>
            )}
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-600/20 transition-colors"
            >
              {currentTarget != null ? 'Update target' : 'Set target'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SetPriceModal;
