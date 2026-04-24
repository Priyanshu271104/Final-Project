import React, { useState } from 'react';
import { Search, TrendingUp } from 'lucide-react';

const Hero = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center pt-16 bg-gradient-to-br from-[#1a3c8a] via-[#1e40af] to-[#3b82f6]">
      
      {/* Background Noise Texture for Modern Look */}
      <div 
        className="absolute inset-0 opacity-20 mix-blend-overlay pointer-events-none" 
        style={{backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`}}
      ></div>
      
      <div className="relative z-10 w-full max-w-4xl px-6 text-center space-y-8">
        {/* Headlines */}
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.1]">
          Find Better. <br/> Pay Less.
        </h1>
        <p className="text-lg md:text-xl text-blue-100/90 max-w-2xl mx-auto font-light">
          Our system scours Amazon, Flipkart, and more to find you the best deals in real-time.
        </p>
        
        {/* Search Bar */}
        <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto relative group">
          <div className="relative flex items-center bg-white rounded-xl shadow-2xl p-2 transition-transform duration-300 focus-within:scale-[1.01]">
            <Search className="ml-4 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search for products (e.g., iPhone 15)..." 
              className="w-full px-4 py-3 text-base text-slate-900 bg-transparent outline-none" 
              value={query} 
              onChange={(e) => setQuery(e.target.value)} 
            />
            <button 
              type="submit" 
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg flex items-center gap-2 shadow-md"
            >
              Search
            </button>
          </div>
        </form>
        
        {/* Popular Tags */}
        <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-blue-200/80 mt-8">
          <TrendingUp className="w-4 h-4" /> <span className="font-medium">Popular:</span>
          {['iPhone 15', 'Sony WH-1000XM5', 'MacBook Air'].map((item) => (
            <button 
              key={item} 
              onClick={() => onSearch(item)} 
              className="hover:text-white hover:underline decoration-blue-300 underline-offset-4 transition-all"
            >
              {item}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Hero;