// frontend/src/pages/Tenant/PaymentPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Layout/Navbar';
import { paymentAPI, bookingAPI } from '../../services/api';

const PaymentPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  
  const [booking, setBooking] = useState(null);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('esewa');
  const [showProofModal, setShowProofModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600);
  const [proofData, setProofData] = useState({
    transaction_id: '',
    screenshot: null
  });

  useEffect(() => {
    loadBooking();
  }, [bookingId]);

  useEffect(() => {
    if (payment && payment.expires_at) {
      const timer = setInterval(() => {
        const now = new Date().getTime();
        const expiry = new Date(payment.expires_at).getTime();
        const diff = Math.floor((expiry - now) / 1000);
        
        if (diff <= 0) {
          setTimeLeft(0);
          clearInterval(timer);
        } else {
          setTimeLeft(diff);
        }
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [payment]);

  const loadBooking = async () => {
    try {
      const response = await bookingAPI.getById(bookingId);
      setBooking(response.data.booking);
      
      const paymentResponse = await paymentAPI.getByBooking(bookingId);
      if (paymentResponse.data.payment) {
        setPayment(paymentResponse.data.payment);
      }
    } catch (error) {
      console.error('Error loading booking:', error);
      alert('Booking not found');
      navigate('/tenant/bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQR = async () => {
    try {
      const response = await paymentAPI.create({
        booking_id: bookingId,
        payment_method: paymentMethod
      });
      
      setPayment(response.data.payment);
      
      alert('QR Code generated! Scan to pay within 10 minutes.');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to generate QR code');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofData({ ...proofData, screenshot: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitProof = async (e) => {
    e.preventDefault();
    
    if (!proofData.transaction_id) {
      alert('Please enter transaction ID');
      return;
    }
    
    try {
      await paymentAPI.submitProof({
        payment_id: payment.payment_id,
        transaction_id: proofData.transaction_id,
        screenshot: proofData.screenshot
      });
      
      alert('Payment proof submitted! Admin will verify shortly.');
      setShowProofModal(false);
      loadBooking();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to submit proof');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <>
        {/* <Navbar /> */}
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[var(--color-primary)] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading payment details...</p>
          </div>
        </div>
      </>
    );
  }

  if (!booking) {
    return (
      <>
        {/* <Navbar /> */}
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2" style={{color: 'var(--color-primary)'}}>Booking Not Found</h2>
            <button onClick={() => navigate('/tenant/bookings')} className="btn-primary">
              View My Bookings
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* <Navbar /> */}
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate('/tenant/bookings')}
            className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors font-medium"
          >
            ← Back to Bookings
          </button>

          {/* Payment Header */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold" style={{color: 'var(--color-primary)'}}>💳 Payment</h1>
              <div className={`px-4 py-2 rounded-lg font-bold text-sm ${
                booking.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                booking.payment_status === 'pending_verification' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {booking.payment_status === 'paid' ? '✓ Paid' :
                 booking.payment_status === 'pending_verification' ? '⏳ Pending Verification' :
                 '❌ Not Paid'}
              </div>
            </div>

            {/* Booking Summary */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h3 className="font-bold text-lg mb-3" style={{color: 'var(--color-primary)'}}>Booking Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Property</div>
                  <div className="font-semibold">{booking.property_title}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Address</div>
                  <div className="font-semibold">{booking.property_address}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Move-in Date</div>
                  <div className="font-semibold">{new Date(booking.start_date).toLocaleDateString()}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Amount</div>
                  <div className="text-2xl font-bold" style={{color: 'var(--color-accent)'}}>
                    ${booking.total_price}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Status */}
          {booking.payment_status === 'paid' ? (
            <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6 text-center">
              <div className="text-6xl mb-4">✅</div>
              <h2 className="text-2xl font-bold text-green-800 mb-2">Payment Verified!</h2>
              <p className="text-green-700 mb-4">Your payment has been confirmed. You can now contact the owner.</p>
              <div className="bg-white rounded-lg p-4 max-w-md mx-auto">
                <h3 className="font-bold mb-3">Owner Contact Details</h3>
                <div className="space-y-2 text-left">
                  <div>
                    <div className="text-sm text-gray-600">Name</div>
                    <div className="font-semibold">{booking.owner_name}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Email</div>
                    <div className="font-semibold">{booking.owner_email}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Phone</div>
                    <div className="font-semibold">{booking.owner_phone}</div>
                  </div>
                </div>
                <a
                  href={`https://wa.me/${booking.owner_phone?.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary w-full mt-4 bg-green-600 hover:bg-green-700"
                >
                  💬 Contact via WhatsApp
                </a>
              </div>
            </div>
          ) : booking.payment_status === 'pending_verification' ? (
            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6 text-center">
              <div className="text-6xl mb-4">⏳</div>
              <h2 className="text-2xl font-bold text-yellow-800 mb-2">Verification Pending</h2>
              <p className="text-yellow-700">Your payment proof is being verified by our admin team. This usually takes 5-10 minutes.</p>
            </div>
          ) : (
            <>
              {/* Payment Method Selection */}
              {!payment && (
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                  <h2 className="text-xl font-bold mb-4" style={{color: 'var(--color-primary)'}}>Select Payment Method</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <button
                      onClick={() => setPaymentMethod('esewa')}
                      className={`p-4 border-2 rounded-lg transition-all ${
                        paymentMethod === 'esewa' 
                          ? 'border-green-500 bg-green-50' 
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="text-4xl mb-2">💚</div>
                      <div className="font-bold">eSewa</div>
                    </button>
                    <button
                      onClick={() => setPaymentMethod('khalti')}
                      className={`p-4 border-2 rounded-lg transition-all ${
                        paymentMethod === 'khalti' 
                          ? 'border-purple-500 bg-purple-50' 
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="text-4xl mb-2">💜</div>
                      <div className="font-bold">Khalti</div>
                    </button>
                  </div>
                  <button onClick={handleGenerateQR} className="btn-primary w-full">
                    Generate QR Code
                  </button>
                </div>
              )}

              {/* QR Code Display */}
              {payment && timeLeft > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="text-center mb-6">
                    <h2 className="text-xl font-bold mb-2" style={{color: 'var(--color-primary)'}}>Scan QR to Pay</h2>
                    <div className={`inline-block px-6 py-3 rounded-lg font-bold text-2xl ${
                      timeLeft <= 60 ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      ⏱️ {formatTime(timeLeft)}
                    </div>
                    <p className="text-sm text-gray-600 mt-2">Time remaining to complete payment</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* ========== BACKEND GENERATED QR CODE (COMMENTED OUT) ========== */}
                    {/* <div className="bg-gray-50 rounded-lg p-6 flex flex-col items-center justify-center">
                      <h3 className="font-bold text-lg mb-4 text-gray-700">Payment QR Code</h3>
                      <img src={payment.qr_code} alt="Payment QR Code" className="w-64 h-64 border-4 border-gray-300 rounded-lg" />
                      <p className="text-sm text-gray-600 mt-4 text-center">Scan this QR code with your {paymentMethod === 'esewa' ? 'eSewa' : 'Khalti'} app</p>
                    </div> */}
                    {/* ========== END OF COMMENTED SECTION ========== */}

                    {/* User Details Section */}
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border-2 border-blue-300">
                      <h3 className="font-bold text-lg mb-4" style={{color: 'var(--color-primary)'}}>Payment Details</h3>
                      <div className="space-y-4">
                        <div className="bg-white rounded-lg p-4">
                          <div className="text-sm text-gray-600 mb-1">Tenant Name</div>
                          <div className="font-bold text-lg">{booking.tenant_name || 'User'}</div>
                        </div>

                        <div className="bg-white rounded-lg p-4">
                          <div className="text-sm text-gray-600 mb-1">Booking ID</div>
                          <div className="font-bold text-lg font-mono"># {booking.id}</div>
                        </div>

                        <div className="bg-white rounded-lg p-4">
                          <div className="text-sm text-gray-600 mb-1">Payment Amount</div>
                          <div className="text-3xl font-bold" style={{color: 'var(--color-accent)'}}>
                            Rs {booking.total_price}
                          </div>
                        </div>

                        <div className="bg-white rounded-lg p-4">
                          <div className="text-sm text-gray-600 mb-1">Payment Method</div>
                          <div className="font-bold text-lg">
                            {paymentMethod === 'esewa' ? '💚 eSewa' : '💜 Khalti'}
                          </div>
                        </div>

                        <div className="bg-white rounded-lg p-4">
                          <div className="text-sm text-gray-600 mb-1">Platform Account</div>
                          <div className="font-bold text-sm">{payment.platform_account}</div>
                        </div>

                        <div className="bg-white rounded-lg p-4">
                          <div className="text-sm text-gray-600 mb-1">Transaction ID</div>
                          <div className="font-mono text-sm font-semibold text-gray-700">{payment.payment_id}</div>
                        </div>
                      </div>
                    </div>

                    {/* User-owned QR (public/qr.jpg) - MAIN QR CODE */}
                    <div className="bg-gray-50 rounded-lg p-6 flex flex-col items-center justify-center">
                      <h3 className="font-bold text-lg mb-4 text-gray-700">Payment QR Code</h3>
                      <img
                        src="/public/QR_code.webp"
                        alt="Payment QR Code"
                        onError={(e) => { e.target.style.display = 'none'; }}
                        className="w-64 h-64 object-contain border-4 border-gray-300 rounded-lg"
                      />
                      <p className="text-sm text-gray-600 mt-4 text-center">Scan this QR code with your {paymentMethod === 'esewa' ? 'eSewa' : 'Khalti'} app</p>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-300 rounded-lg p-4 mb-6">
                    <h3 className="font-bold mb-2 text-blue-800">📱 Payment Instructions</h3>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-blue-900">
                      <li>Open your {paymentMethod === 'esewa' ? 'eSewa' : 'Khalti'} app</li>
                      <li>Select "Scan QR" or "Send Money"</li>
                      <li>Scan the QR code above</li>
                      <li>Verify the amount: ${payment.amount}</li>
                      <li>Complete the payment</li>
                      <li>Submit your transaction ID below</li>
                    </ol>
                  </div>

                  <button
                    onClick={() => setShowProofModal(true)}
                    className="btn-primary w-full"
                  >
                    I've Made the Payment - Submit Proof
                  </button>
                </div>
              )}

              {payment && timeLeft === 0 && (
                <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6 text-center">
                  <div className="text-6xl mb-4">⏰</div>
                  <h2 className="text-2xl font-bold text-red-800 mb-2">QR Code Expired</h2>
                  <p className="text-red-700 mb-4">The payment window has closed. Please generate a new QR code.</p>
                  <button onClick={handleGenerateQR} className="btn-primary">
                    Generate New QR Code
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Proof Submission Modal */}
      {showProofModal && (
        <div className="modal-overlay">
          <div className="modal-content max-w-md">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-bold" style={{color: 'var(--color-primary)'}}>Submit Payment Proof</h2>
              <button onClick={() => setShowProofModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmitProof} className="p-6 space-y-4">
              <div>
                <label className="form-label">Transaction ID *</label>
                <input
                  type="text"
                  required
                  className="input-ui"
                  placeholder="Enter your transaction ID"
                  value={proofData.transaction_id}
                  onChange={(e) => setProofData({...proofData, transaction_id: e.target.value})}
                />
                <p className="text-xs text-gray-500 mt-1">You'll find this in your payment confirmation</p>
              </div>

              <div>
                <label className="form-label">Payment Screenshot (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  className="input-ui"
                  onChange={handleFileChange}
                />
                {proofData.screenshot && (
                  <img src={proofData.screenshot} alt="Preview" className="mt-2 w-full h-32 object-cover rounded-lg" />
                )}
              </div>

              <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  ⚠️ Please ensure your transaction ID is correct. Our admin team will verify your payment within 5-10 minutes.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowProofModal(false)} className="flex-1 btn-outline">
                  Cancel
                </button>
                <button type="submit" className="flex-1 btn-primary">
                  Submit Proof
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default PaymentPage;