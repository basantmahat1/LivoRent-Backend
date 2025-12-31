// frontend/src/pages/Admin/PaymentVerification.jsx
import React, { useState, useEffect } from 'react';
import { paymentAPI } from '../../services/api';

const PaymentVerification = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending_verification');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    loadPayments();
  }, [filter]);

  const loadPayments = async () => {
    try {
      const params = filter !== 'all' ? { status: filter } : {};
      const response = await paymentAPI.getAllPayments(params);
      setPayments(response.data.payments);
    } catch (error) {
      console.error('Error loading payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (paymentId, status) => {
    if (!confirm(`Are you sure you want to ${status} this payment?`)) return;

    try {
      await paymentAPI.verifyPayment(paymentId, { status, admin_notes: adminNotes });
      alert(`Payment ${status} successfully!`);
      setShowModal(false);
      setSelectedPayment(null);
      setAdminNotes('');
      loadPayments();
    } catch (error) {
      alert(error.response?.data?.message || `Failed to ${status} payment`);
    }
  };

  const openVerificationModal = (payment) => {
    setSelectedPayment(payment);
    setShowModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending_verification': return 'bg-yellow-100 text-yellow-800';
      case 'verified': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600 mx-auto mb-4"></div>
          <p>Loading payments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6 bg-gray-50">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Payment Verification</h1>
            <p className="text-gray-600 text-sm">Review and verify payment submissions</p>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-600">Total Payments</div>
            <div className="text-xl md:text-2xl font-bold">{payments.length}</div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg p-3 shadow-sm flex flex-wrap gap-2">
          {['all', 'pending_verification', 'verified', 'rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1 text-xs rounded border ${
                filter === status
                  ? 'bg-gray-800 text-white border-gray-800'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-gray-800'
              }`}
            >
              {status === 'all' ? 'All Payments' : status.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Payments List */}
        {payments.length === 0 ? (
          <div className="bg-white rounded-lg p-6 text-center shadow-sm">
            <div className="text-4xl mb-2">💳</div>
            <h2 className="text-lg font-bold mb-1">No payments found</h2>
            <p className="text-gray-600 text-sm">There are no payments matching your filter.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {payments.map((payment) => (
              <div key={payment.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 md:p-6 flex flex-col md:flex-row justify-between gap-4">
                  {/* Left Section */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 text-xs">
                      <span className={`px-2 py-1 rounded ${getStatusColor(payment.payment_status)}`}>
                        {payment.payment_status.replace('_', ' ')}
                      </span>
                      <span className="text-gray-500">{new Date(payment.created_at).toLocaleString()}</span>
                    </div>
                    <h3 className="text-lg font-bold">{payment.property_title}</h3>
                    <div className="text-base font-semibold">${payment.amount}</div>

                    <div className="bg-gray-50 rounded p-2 text-sm space-y-1">
                      <div><strong>Tenant:</strong> {payment.tenant_name}</div>
                      <div><strong>Owner:</strong> {payment.owner_name}</div>
                      <div><strong>Method:</strong> {payment.payment_method}</div>
                      {payment.transaction_id && (
                        <div><strong>Transaction:</strong> {payment.transaction_id}</div>
                      )}
                    </div>
                  </div>

                  {/* Right Section - Payment Proof */}
                  {payment.payment_proof && (
                    <div className="w-32 md:w-40 flex-shrink-0">
                      <div className="text-xs font-semibold mb-1">Payment Proof</div>
                      <img
                        src={payment.payment_proof}
                        alt="Proof"
                        className="w-full h-32 md:h-40 object-cover rounded border border-gray-300 cursor-pointer hover:border-gray-800"
                        onClick={() => window.open(payment.payment_proof, '_blank')}
                      />
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                {payment.payment_status === 'pending_verification' && (
                  <div className="flex gap-2 p-2 border-t border-gray-200">
                    <button
                      onClick={() => openVerificationModal(payment)}
                      className="flex-1 bg-green-600 text-white py-1 rounded text-sm hover:bg-green-700"
                    >
                      Verify
                    </button>
                    <button
                      onClick={() => handleVerify(payment.payment_id, 'rejected')}
                      className="flex-1 bg-red-600 text-white py-1 rounded text-sm hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Verification Modal */}
      {showModal && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-bold">Verify Payment</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 text-xl">×</button>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span>Payment ID:</span> <span>{selectedPayment.payment_id}</span></div>
              <div className="flex justify-between"><span>Amount:</span> <span className="font-semibold">${selectedPayment.amount}</span></div>
              <div className="flex justify-between"><span>Transaction ID:</span> <span>{selectedPayment.transaction_id}</span></div>
              <div className="flex justify-between"><span>Tenant:</span> <span>{selectedPayment.tenant_name}</span></div>
            </div>

            {selectedPayment.payment_proof && (
              <div className="mt-2">
                <img
                  src={selectedPayment.payment_proof}
                  alt="Proof"
                  className="w-full h-32 object-cover rounded border border-gray-300"
                />
              </div>
            )}

            <textarea
              className="w-full mt-2 p-2 border rounded text-sm resize-none"
              rows="3"
              placeholder="Admin notes..."
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
            />

            <div className="flex gap-2 mt-2">
              <button onClick={() => setShowModal(false)} className="flex-1 border py-1 rounded text-sm">Cancel</button>
              <button
                onClick={() => handleVerify(selectedPayment.payment_id, 'verified')}
                className="flex-1 bg-green-600 text-white py-1 rounded text-sm hover:bg-green-700"
              >
                Verify
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentVerification;
