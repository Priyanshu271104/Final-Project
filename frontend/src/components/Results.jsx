import React, { useState, useEffect } from 'react';
import { Loader2, ArrowLeft, AlertCircle } from 'lucide-react';
import ProductCard from './ProductCard'; 

const Results = ({ query, onBack, onSelectProduct }) => {
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null); // Added error state
  
  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`http://localhost:5000/api/search?q=${encodeURIComponent(query)}`);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to fetch from backend');
        }
        
        const data = await response.json();
        
        if (isMounted) { 
            if (data.length === 0) throw new Error('No products found for this search.');
            setResults(data); 
            setLoading(false); 
        }

      } catch (err) {
        console.error("Backend fetch failed:", err);
        if (isMounted) {
            setError(err.message); // Set the actual error to display
            
            // FALLBACK: Safer demo data with a working image just in case
            setResults([{
               id: 'demo-1', 
               name: 'Apple iPhone 15 (128 GB) - Black (DEMO DATA)', 
               image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=300&auto=format&fit=crop', // Working Unsplash image
               rating: 4.8, 
               reviews: 1240, 
               category: 'Mobiles', 
               currentPrice: 72999,
               stores: [{ name: 'Amazon', price: 72999, logo: 'AMZ', color: 'text-yellow-600', link: 'https://amazon.in' }],
               history: [{ date: 'Oct', price: 79900 }, { date: 'Nov', price: 76000 }, { date: 'Jan', price: 72999 }]
            }]);
            setLoading(false);
        }
      }
    };

    if (query) fetchData();
    return () => { isMounted = false; };
  }, [query]);

  if (loading) {
      return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center pt-16">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
            <p className="text-slate-500 mt-4 font-medium">Searching stores for "{query}"...</p>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-12 animate-in fade-in duration-500">
      <div className="max-w-5xl mx-auto px-4">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-medium transition-colors w-fit">
                <ArrowLeft className="w-5 h-5" /> Back to Search
            </button>
            <h2 className="text-2xl font-bold text-slate-900">
                Results for "<span className="text-blue-600">{query}</span>"
            </h2>
        </div>

        {/* Error Banner */}
        {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                    <p className="font-bold">Backend Connection Issue</p>
                    <p className="text-sm mt-1">{error}. Showing demo data instead.</p>
                </div>
            </div>
        )}

        <div className="space-y-6">
          {results.length > 0 ? (
              results.map(product => (
                <ProductCard key={product.id} product={product} onSelect={onSelectProduct} />
              ))
          ) : (
              <div className="text-center py-20">
                  <p className="text-slate-400 text-lg">No products found. Try a different search.</p>
              </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Results;