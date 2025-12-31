import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '', role: 'tenant'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [step, setStep] = useState('form'); // form, otp, completed
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [tempFormData, setTempFormData] = useState(null);
  const { signup } = useAuth();
  const navigate = useNavigate();

  // Timer for OTP resend
  useEffect(() => {
    if (otpTimer > 0) {
      const interval = setInterval(() => setOtpTimer(t => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [otpTimer]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const sendOtp = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name.trim()) return setError('Name is required');
    if (!formData.email.trim()) return setError('Email is required');
    if (!formData.password) return setError('Password is required');
    if (formData.password !== formData.confirmPassword) return setError('Passwords do not match');
    
    setError('');
    setOtpLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/otp/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, name: formData.name })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send OTP');
      }

      setSuccess('OTP sent successfully! Check your email.');
      setOtpSent(true);
      setTempFormData(formData);
      setStep('otp');
      setOtpTimer(60); // 1 minutes timer
      setOtp('');
    } catch (err) {
      setError(err.message);
    } finally {
      setOtpLoading(false);
    }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();

    if (!otp.trim()) {
      setOtpError('OTP is required');
      return;
    }

    setOtpError('');
    setOtpLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/otp/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: tempFormData.email, otp: otp.trim() })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Invalid OTP');
      }

      // OTP verified, now sign up
      setOtpError('');
      await completeSignup();
    } catch (err) {
      setOtpError(err.message);
    } finally {
      setOtpLoading(false);
    }
  };

  const completeSignup = async () => {
    try {
      const result = await signup(tempFormData);
      if (result.success) {
        setSuccess('Registration successful! Redirecting to login...');
        setStep('completed');
        setTimeout(() => {
          navigate('/login', { state: { message: 'Registration successful!' } });
        }, 2000);
      } else {
        setOtpError(result.error || 'Registration failed');
      }
    } catch (err) {
      setOtpError(err.message || 'Registration failed');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) return setError('Passwords do not match');
    setLoading(true);
    const result = await signup(formData);
    setLoading(false);
    if (result.success) navigate('/login', { state: { message: 'Registration successful!' } });
    else setError(result.error);
  };

  return (
    <>
      <div className="min-h-screen bg-[var(--color-bg-light)] flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-sm border border-gray-200">
          {/* FORM STEP */}
          {step === 'form' && (
            <>
              <h2 className="text-center text-3xl font-bold text-gradient">Create Account</h2>
              
              <form className="space-y-5" onSubmit={sendOtp}>
                {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}
                {success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">{success}</div>}
                
                <div>
                  <label className="form-label">Full Name</label>
                  <input 
                    name="name" 
                    type="text" 
                    required 
                    className="input-ui" 
                    value={formData.name}
                    onChange={handleChange} 
                    placeholder="John Doe"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div
                    onClick={() => setFormData({...formData, role: 'tenant'})}
                    className={formData.role === 'tenant' ? 'selection-btn-active' : 'selection-btn'}
                  >
                    <span className="block text-xl">👤</span>
                    <span className="font-bold">Tenant</span>
                  </div>
                  <div
                    onClick={() => setFormData({...formData, role: 'owner'})}
                    className={formData.role === 'owner' ? 'selection-btn-active' : 'selection-btn'}
                  >
                    <span className="block text-xl">🏢</span>
                    <span className="font-bold">Owner</span>
                  </div>
                </div>

                <div>
                  <label className="form-label">Email</label>
                  <input 
                    name="email" 
                    type="email" 
                    required 
                    className="input-ui" 
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label className="form-label">Password</label>
                  <input 
                    name="password" 
                    type="password" 
                    required 
                    className="input-ui"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Min 6 characters"
                  />
                </div>

                <div>
                  <label className="form-label">Confirm Password</label>
                  <input 
                    name="confirmPassword" 
                    type="password" 
                    required 
                    className="input-ui"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={otpLoading} 
                  className="btn-primary w-full"
                >
                  {otpLoading ? 'Sending OTP...' : 'Send Verification Code'}
                </button>
                
                <p className="text-center text-sm">
                  Already have an account? <Link to="/login" className="text-[var(--color-secondary)] font-bold">Sign in</Link>
                </p>
              </form>
            </>
          )}

          {/* OTP VERIFICATION STEP */}
          {step === 'otp' && (
            <>
              <div className="text-center">
                <div className="text-4xl mb-2">📧</div>
                <h2 className="text-2xl font-bold text-gray-900">Verify Email</h2>
                <p className="text-gray-600 mt-2">
                  Enter the 6-digit code sent to<br/><strong>{tempFormData?.email}</strong>
                </p>
              </div>

              <form className="space-y-5" onSubmit={verifyOtp}>
                {otpError && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{otpError}</div>}
                {success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">{success}</div>}

                <div>
                  <label className="form-label text-center">Verification Code</label>
                  <input
                    type="text"
                    maxLength="6"
                    className="input-ui text-center text-2xl font-bold tracking-widest"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    required
                  />
                </div>

             

                <button
                  type="submit"
                  disabled={otpLoading || otp.length !== 6}
                  className="btn-primary w-full"
                >
                  {otpLoading ? 'Verifying...' : 'Verify & Create Account'}
                </button>

                <button
                  type="button"
                  disabled={otpTimer > 0 || otpLoading}
                  onClick={sendOtp}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {otpTimer > 0 ? `Resend in ${otpTimer}s` : 'Resend Code'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStep('form');
                    setOtp('');
                    setOtpError('');
                    setSuccess('');
                  }}
                  className="w-full text-center text-sm text-gray-600 hover:text-gray-900"
                >
                  ← Back to registration
                </button>
              </form>
            </>
          )}

          {/* COMPLETED STEP */}
          {step === 'completed' && (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">✅</div>
              <h2 className="text-2xl font-bold text-green-600 mb-2">Account Created!</h2>
              <p className="text-gray-600 mb-6">Your account has been verified and created successfully.</p>
              <p className="text-sm text-gray-500">Redirecting to login...</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Signup;