import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  return (
    <nav className="bg-[var(--color-primary)] text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-20 flex justify-between items-center">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 text-2xl font-bold tracking-tight"
        >
          {/* Logo Image */}
          <img
            src="/logo.png"
            alt="LivoRent Logo"
            className="w-14 h-14 object-contain"
          />

          {/* Brand Text */}
          <span>
            Livo
            <span className="text-[var(--color-secondary)]">Rent</span>
          </span>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-8 text-sm font-medium">
          <Link to="/" className="hover:text-[var(--color-secondary)] transition">
            Home
          </Link>
          <Link to="/allProperties" className="hover:text-[var(--color-secondary)] transition">
            All Properties
          </Link>
          {/* <Link to="/faq" className="hover:text-[var(--color-secondary)] transition">
            FAQ
          </Link> */}

          {!isAuthenticated ? (
            <div className="flex items-center gap-6">
              {/* Login button with genie effect */}
              <button
                onClick={handleLoginClick}
                className="login-button-genie hover:text-[var(--color-secondary)] transition-all font-semibold"
              >
                Login
              </button>
              <Link to="/signup" className="btn-primary py-2 px-8">
                Join Now
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <span className="text-gray-300">Welcome, {user?.name}</span>
              
              {user?.role === 'tenant' && (
                <div className="relative">
                  <button 
                    onClick={() => setShowDropdown(!showDropdown)} 
                    className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 text-white font-bold transition-all"
                  >
                    {user?.name?.charAt(0).toUpperCase()}
                  </button>
                  
                  {showDropdown && (
                    <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg py-2 z-50">
                      <button 
                        onClick={() => { navigate('/tenant/profile'); setShowDropdown(false); }} 
                        className="w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100 transition"
                      >
                        👤 Profile
                      </button>
                      <button 
                        onClick={() => { navigate('/tenant/bookings'); setShowDropdown(false); }} 
                        className="w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100 transition"
                      >
                        📅 My Bookings
                      </button>
                      <button 
                        onClick={() => { navigate('/tenant/payments'); setShowDropdown(false); }} 
                        className="w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100 transition"
                      >
                        💳 Payments
                      </button>
                      <hr className="my-1" />
                      <button 
                        onClick={handleLogout} 
                        className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 transition"
                      >
                        🚪 Logout
                      </button>
                    </div>
                  )}
                </div>
              )}
              
              {user?.role !== 'tenant' && (
                <button 
                  onClick={handleLogout} 
                  className="btn-outline text-xs py-1.5 px-4"
                >
                  Logout
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;