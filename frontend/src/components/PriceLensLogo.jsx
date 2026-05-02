  import React from 'react';

  const PriceLensLogo = () => (
    <svg 
      width="36" 
      height="36" 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className="group-hover:scale-105 transition-transform duration-300 drop-shadow-md"
    >
      <defs>
        {/* 1. Deep Blue Metallic Gradient for the Ring */}
        <linearGradient id="rimGradient" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1e3a8a" />
          <stop offset="50%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#172554" />
        </linearGradient>

        {/* 2. Golden Gradient for the Rupee Symbol */}
        <linearGradient id="goldGradient" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#d4af37" />
          <stop offset="40%" stopColor="#fcd34d" />
          <stop offset="100%" stopColor="#856838" />
        </linearGradient>

        {/* 3. Glass Reflection Effect */}
        <linearGradient id="glassGradient" x1="20" y1="20" x2="80" y2="80" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="white" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#e0f2fe" stopOpacity="0.1" />
        </linearGradient>
      </defs>

      {/* The Magnifying Glass Handle */}
      <g transform="rotate(45, 50, 50)">
        <rect x="42" y="75" width="16" height="30" rx="4" fill="#1e3a8a" stroke="#0f172a" strokeWidth="1"/>
        <rect x="42" y="95" width="16" height="6" rx="2" fill="url(#goldGradient)" />
        <rect x="42" y="75" width="16" height="3" fill="url(#goldGradient)" />
      </g>

      {/* The Lens Frame */}
      <circle cx="45" cy="45" r="32" stroke="url(#rimGradient)" strokeWidth="8" fill="white" />
      <circle cx="45" cy="45" r="32" stroke="#000" strokeWidth="1" strokeOpacity="0.1" fill="none" /> 
      
      {/* The Glass Reflection */}
      <circle cx="45" cy="45" r="28" fill="url(#glassGradient)" />

      {/* The Rupee Symbol inside the Lens */}
      <text 
        x="45" 
        y="60" 
        fontSize="42" 
        fontWeight="bold" 
        fill="url(#goldGradient)" 
        textAnchor="middle" 
        fontFamily="serif" 
        style={{ filter: 'drop-shadow(1px 1px 1px rgba(0,0,0,0.3))' }}
      >
        ₹
      </text>

      {/* Lens Glare Highlight */}
      <path d="M25 25 Q 45 15 65 25" stroke="white" strokeWidth="2" strokeOpacity="0.8" fill="none" strokeLinecap="round"/>
    </svg>
  );

  export default PriceLensLogo;