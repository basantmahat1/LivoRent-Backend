import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const SignupModalNew = ({ isOpen, onClose, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    name: '', 
    email: '', 
    password: '', 
    confirmPassword: '', 
    role: 'tenant'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const { signup } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    const result = await signup(formData);
    
    if (result.success) {
      setSuccess(result.message || 'Registration successful! Please login now.');
      setTimeout(() => {
        handleClose();
        setTimeout(() => onSwitchToLogin(), 100);
      }, 1500);
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  const handleClose = () => {
    setFormData({ name: '', email: '', password: '', confirmPassword: '', role: 'tenant' });
    setError('');
    setSuccess('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-slideUp">
        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors text-2xl"
            >
              ✕
            </button>
          </div>

          <p className="text-gray-500 mb-8">Join us to get started</p>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm animate-shake">
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 text-sm">
              {success}
            </div>
          )}

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name
              </label>
              <input 
                type="text" 
                name="name"
                required 
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#00BFA5] focus:ring-2 focus:ring-[#00BFA5]/20 outline-none transition-all"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your name"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <input 
                type="email" 
                name="email"
                required 
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#00BFA5] focus:ring-2 focus:ring-[#00BFA5]/20 outline-none transition-all"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Role
              </label>
              <select 
                name="role"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#00BFA5] focus:ring-2 focus:ring-[#00BFA5]/20 outline-none transition-all"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="tenant">Tenant (Looking for room)</option>
                <option value="owner">Owner (Listing property)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <input 
                type="password" 
                name="password"
                required 
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#00BFA5] focus:ring-2 focus:ring-[#00BFA5]/20 outline-none transition-all"
                value={formData.password}
                onChange={handleChange}
                placeholder="Min 6 characters"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Confirm Password
              </label>
              <input 
                type="password" 
                name="confirmPassword"
                required 
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#00BFA5] focus:ring-2 focus:ring-[#00BFA5]/20 outline-none transition-all"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter password"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-[#00BFA5] hover:bg-[#1A2B3C] text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="text-gray-500 text-sm">or</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>

          {/* Switch to Login */}
          <p className="text-center text-sm text-gray-600">
            Already have an account? {' '}
            <button 
              onClick={() => {
                handleClose();
                setTimeout(() => onSwitchToLogin(), 100);
              }}
              className="text-[#00BFA5] font-bold hover:underline"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupModalNew;
