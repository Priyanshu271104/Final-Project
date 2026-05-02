import React from "react";
import { Heart, LogOut } from "lucide-react";
import PriceLensLogo from "./PriceLensLogo";

const Header = ({
  setView,
  user,
  onAuthRequest,
  onLogout,
  onWishlistClick,
  view,
}) => {
  // Determine if we are on the homepage to toggle styles
  const isHome = view === "home";

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 shadow-sm h-16 flex items-center justify-between px-4 md:px-8 lg:px-16 transition-colors duration-300 ${isHome ? "bg-white" : "bg-gradient-to-r from-[#1a3c8a] to-[#3b82f6]"}`}
    >
      {/* Logo Section - Click to go Home */}
      <div
        className="flex items-center gap-3 cursor-pointer group"
        onClick={() => setView && setView("home")}
      >
        <div className="flex items-center justify-center w-10 h-10 text-sm">
  <PriceLensLogo />
</div>
        <span className="text-2xl font-serif font-medium tracking-tight ml-1 leading-none">
          {" "}
          <span className={`${isHome ? "text-[#333333]" : "text-white font-semibold drop-shadow-sm"}`}>
            Price
          </span>
          <span className="text-[#a17a35]">Lens</span>
        </span>
      </div>

      {/* Navigation / User Section */}
      <nav className="flex items-center gap-4">
        {user ? (
          /* Logged In State */
          <div className="flex items-center gap-4">
            {/* Wishlist Toggle Button */}
            <button
              onClick={onWishlistClick}
              className={`p-2 rounded-lg transition-all ${isHome ? "text-slate-400 hover:text-pink-500 hover:bg-pink-50" : "text-white/80 hover:text-white hover:bg-white/10"}`}
              title="My Wishlist"
            >
              <Heart className="w-6 h-6" />
            </button>

            {/* User Info (Hidden on mobile) */}
            <div className="hidden md:flex flex-col items-end mr-2 max-w-[160px]">
              <span
                className={`text-sm font-bold truncate ${isHome ? "text-slate-900" : "text-white"}`}
              >
                {user.displayName || "User"}
              </span>
              <span
                className={`text-xs truncate ${isHome ? "text-slate-500" : "text-blue-100"}`}
              >
                {user.email?.split("@")[0]}
              </span>
            </div>

            {/* User Avatar Circle */}
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold shadow-md ${isHome ? "bg-gradient-to-tr from-blue-500 to-purple-500" : "bg-white/20 border border-white/30"}`}
            >
              {(
                (user.displayName || user.email || "U")[0] || "U"
              ).toUpperCase()}{" "}
            </div>

            {/* Logout Button */}
            <button
              onClick={onLogout}
              className={`p-2 rounded-lg ${isHome ? "text-slate-400 hover:text-red-600 hover:bg-red-50" : "text-white/80 hover:text-red-300 hover:bg-red-500/20"}`}
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        ) : (
          /* Guest State */
          <>
            <button
              onClick={() => onAuthRequest("login")}
              className={`text-sm font-medium px-2 py-2 ${isHome ? "text-slate-600 hover:text-blue-600" : "text-white/90 hover:text-white"}`}
            >
              Login
            </button>
            <button
              onClick={() => onAuthRequest("signup")}
              className={`px-4 py-2 text-sm font-bold rounded-lg shadow-lg ${isHome ? "bg-slate-900 text-white hover:bg-slate-800" : "bg-white text-blue-900 hover:bg-blue-50"}`}
            >
              Sign Up
            </button>
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;
