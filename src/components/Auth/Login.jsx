import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated && user) {
      const redirectTo = location.state?.redirectTo;
      const propertyData = location.state?.propertyData;
      const bookingDetails = location.state?.bookingDetails;
        
      if (redirectTo) {
        navigate(redirectTo, { 
          replace: true,
          state: {
            propertyData,
            bookingDetails
          }
        });
      } else {
        const paths = { 
          admin: '/admin/dashboard', 
          owner: '/owner/dashboard', 
          tenant: '/tenant/dashboard' 
        };
        navigate(paths[user.role] || '/', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate, location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const result = await login(email, password);
    setLoading(false);
    
    if (!result.success) {
      setError(result.error);
    }
  };

  const containerClasses = "min-h-screen bg-[var(--color-bg-light)] flex items-center justify-center py-12 px-4";

  const cardClasses = "card max-w-md w-full p-8";

  return (
    <div className={containerClasses}>
      <div className={cardClasses}>
        <h2 className="text-center text-3xl font-bold mb-2">Welcome Back</h2>
        <p className="text-center text-gray-500 mb-8">
          {location.state?.message || 'Login to your account'}
        </p>

        {error && (
          <div className="alert-error mb-4">
            {error}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="form-label">Email Address</label>
            <input 
              type="email" 
              required 
              className="input-ui" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="form-label">Password</label>
            <input 
              type="password" 
              required 
              className="input-ui" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="btn-secondary w-full"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center space-y-3">
          <p className="text-sm">
            New here? <Link to="/signup" className="text-[var(--color-secondary)] font-bold">Create account</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
