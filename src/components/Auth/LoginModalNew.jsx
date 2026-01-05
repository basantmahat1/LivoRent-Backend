import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const LoginModal = ({ isOpen, onClose, onSwitchToSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const result = await login(email, password);
    setLoading(false);
    
    if (result.success) {
      handleClose();
    } else {
      setError(result.error);
    }
  };

  const handleClose = () => {
    setEmail('');
    setPassword('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-slideUp">
        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors text-2xl"
            >
              ✕
            </button>
          </div>

          <p className="text-gray-500 mb-8">Login to your account</p>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm animate-shake">
              {error}
            </div>
          )}

          {/* Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <input 
                type="email" 
                required 
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#00BFA5] focus:ring-2 focus:ring-[#00BFA5]/20 outline-none transition-all"
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <input 
                type="password" 
                required 
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#00BFA5] focus:ring-2 focus:ring-[#00BFA5]/20 outline-none transition-all"
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-[#00BFA5] hover:bg-[#1A2B3C] text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="text-gray-500 text-sm">or</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>

          {/* Switch to Signup */}
          <p className="text-center text-sm text-gray-600">
            New here? {' '}
            <button 
              onClick={() => {
                handleClose();
                setTimeout(() => onSwitchToSignup(), 100);
              }}
              className="text-[#00BFA5] font-bold hover:underline"
            >
              Create account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
