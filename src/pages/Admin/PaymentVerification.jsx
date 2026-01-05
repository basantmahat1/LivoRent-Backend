import React, { useState, useEffect } from 'react';
import { paymentAPI } from '../../services/api';

const PaymentVerification = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [searchFilters, setSearchFilters] = useState({
    transaction_id: '',
    tenant_name: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const itemsPerPage = 10;
  
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  
  // Image Zoom State
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    loadPayments();
  }, [statusFilter, currentPage, searchFilters]);

  const loadPayments = async () => {
    setLoading(true);
    try {
      const params = {
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(searchFilters.transaction_id && { transaction_id: searchFilters.transaction_id }),
        ...(searchFilters.tenant_name && { tenant_name: searchFilters.tenant_name }),
        limit: itemsPerPage,
        offset: (currentPage - 1) * itemsPerPage
      };

      const response = await paymentAPI.getAllPayments(params);
      setPayments(response.data.payments || []);
      setTotal(response.data.total || 0);
    } catch (error) {
      console.error('Error loading payments:', error);
      setPayments([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (field, value) => {
    setSearchFilters(prev => ({ ...prev, [field]: value }));
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearchFilters({ transaction_id: '', tenant_name: '' });
    setStatusFilter('all');
    setCurrentPage(1);
  };

  const handleVerify = async (paymentId, status) => {
    if (!confirm(`Are you sure you want to ${status} this payment?`)) return;
    try {
      await paymentAPI.verifyPayment(paymentId, { status, admin_notes: adminNotes });
      alert(`Payment ${status} successfully!`);
      closeModal();
      loadPayments();
    } catch (error) {
      alert(error.response?.data?.message || `Failed to ${status} payment`);
    }
  };

  // Improved Image Preview handler
  const openProofImage = (base64Data) => {
    if (!base64Data) return;
    setPreviewImage(base64Data);
  };

  const openVerificationModal = (payment) => {
    setSelectedPayment(payment);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedPayment(null);
    setAdminNotes('');
  };

  const totalPages = Math.ceil(total / itemsPerPage);

  if (loading && payments.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">💳 Payment Verification</h1>
            <p className="text-gray-500">Review and verify tenant transaction submissions</p>
          </div>
          <div className="bg-blue-50 px-6 py-3 rounded-xl border border-blue-100">
            <p className="text-xs font-bold text-blue-400 uppercase">Total Count</p>
            <p className="text-2xl font-black text-blue-600">{total}</p>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-5 bg-white p-1.5 rounded-xl border border-gray-200 flex gap-1">
            {['all', 'pending', 'verified', 'rejected'].map((s) => (
              <button
                key={s}
                onClick={() => { setStatusFilter(s); setCurrentPage(1); }}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                  statusFilter === s ? 'bg-gray-900 text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                {s.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="lg:col-span-7 flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="Search TXN ID..."
              value={searchFilters.transaction_id}
              onChange={(e) => handleSearchChange('transaction_id', e.target.value)}
              className="flex-1 px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none font-medium"
            />
            <input
              type="text"
              placeholder="Search Tenant Name..."
              value={searchFilters.tenant_name}
              onChange={(e) => handleSearchChange('tenant_name', e.target.value)}
              className="flex-1 px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none font-medium"
            />
            <button onClick={handleClearFilters} className="px-4 py-2 bg-white border border-gray-200 rounded-xl font-bold text-gray-400 hover:text-gray-600 transition-colors">Reset</button>
          </div>
        </div>

        {/* Payment List */}
        {payments.length === 0 ? (
          <div className="bg-white rounded-3xl p-20 text-center border-2 border-dashed border-gray-200">
            <p className="text-gray-400 font-bold text-xl">No payments found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {payments.map((payment) => (
              <PaymentCard 
                key={payment.payment_id} 
                payment={payment} 
                onVerify={openVerificationModal}
                onReject={(id) => handleVerify(id, 'rejected')}
                onImageClick={openProofImage}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 pb-10">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="px-4 py-2 bg-white border rounded-lg disabled:opacity-50 font-bold">Prev</button>
            <span className="px-4 py-2 font-bold text-gray-600">Page {currentPage} of {totalPages}</span>
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="px-4 py-2 bg-white border rounded-lg disabled:opacity-50 font-bold">Next</button>
          </div>
        )}
      </div>

      {/* Verification Action Modal */}
      {showModal && selectedPayment && (
        <VerificationModal
          payment={selectedPayment}
          adminNotes={adminNotes}
          setAdminNotes={setAdminNotes}
          closeModal={closeModal}
          handleVerify={handleVerify}
          onImageClick={openProofImage}
        />
      )}

      {/* FULL SCREEN IMAGE POPUP (Z-INDEX 9999) */}
      {previewImage && (
        <div 
          className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 shadow-2xl"
          style={{ zIndex: 9999 }}
          onClick={() => setPreviewImage(null)}
        >
          <button 
            className="absolute top-6 right-6 text-white text-5xl hover:scale-110 transition-transform"
            onClick={() => setPreviewImage(null)}
          >
            &times;
          </button>
          <div className="max-w-5xl w-full flex flex-col items-center gap-4">
            <img 
              src={previewImage} 
              alt="Proof Full Size" 
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-white/10 shadow-lg"
              onClick={(e) => e.stopPropagation()} 
            />
            <p className="text-white/60 font-medium text-sm">Click anywhere outside to close</p>
          </div>
        </div>
      )}
    </div>
  );
};

const PaymentCard = ({ payment, onVerify, onReject, onImageClick }) => {
  const statusStyles = {
    pending: "bg-amber-50 text-amber-600 border-amber-200",
    verified: "bg-emerald-50 text-emerald-600 border-emerald-200",
    rejected: "bg-rose-50 text-rose-600 border-rose-200"
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all">
      <div className="flex flex-col md:flex-row gap-6">
        <div 
          className="w-full md:w-44 h-32 flex-shrink-0 bg-gray-100 rounded-xl overflow-hidden border border-gray-200 relative group cursor-pointer" 
          onClick={() => onImageClick(payment.payment_proof)}
        >
          {payment.payment_proof ? (
            <img src={payment.payment_proof} alt="Proof" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400 font-bold text-[10px]">NO PHOTO</div>
          )}
          <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-[10px] font-black uppercase">View Proof</div>
        </div>

        <div className="flex-1">
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full border font-black uppercase tracking-tight ${statusStyles[payment.payment_status]}`}>
                {payment.payment_status}
              </span>
              <h3 className="text-lg font-bold text-gray-900 mt-1">{payment.property_title}</h3>
            </div>
            <div className="text-right">
              <p className="text-xl font-black text-gray-900">₨ {parseFloat(payment.amount).toLocaleString()}</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase">{new Date(payment.created_at).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 py-4 border-t border-gray-50">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase">Tenant</p>
              <p className="text-sm font-bold text-gray-800">{payment.tenant_name}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase">Owner Details</p>
              <p className="text-sm font-bold text-gray-800">{payment.owner_name || 'System Admin'}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase">TXN ID</p>
              <p className="text-sm font-mono font-bold text-blue-600 truncate">{payment.transaction_id || 'N/A'}</p>
            </div>
            <div className="flex gap-2 justify-end">
              {payment.payment_status === 'pending' && (
                <>
                  <button onClick={() => onReject(payment.payment_id)} className="text-rose-600 hover:bg-rose-50 px-3 py-2 rounded-lg text-xs font-bold transition-colors">Reject</button>
                  <button onClick={() => onVerify(payment)} className="bg-gray-900 text-white px-5 py-2 rounded-lg text-xs font-bold hover:bg-blue-600 transition-all">Verify</button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const VerificationModal = ({ payment, adminNotes, setAdminNotes, closeModal, handleVerify, onImageClick }) => (
  <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
      <div className="px-6 py-4 border-b flex justify-between items-center">
        <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight">Review Submission</h2>
        <button onClick={closeModal} className="text-gray-400 text-2xl hover:text-gray-600">×</button>
      </div>
      <div className="p-6 space-y-4">
        {payment.payment_proof && (
          <div className="relative group cursor-pointer" onClick={() => onImageClick(payment.payment_proof)}>
            <img src={payment.payment_proof} alt="Proof" className="w-full h-40 object-cover rounded-2xl border" />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-all rounded-2xl">Click to enlarge</div>
          </div>
        )}
        <div className="bg-gray-50 p-4 rounded-xl space-y-2 border border-gray-100">
          <div className="flex justify-between text-sm font-bold"><span className="text-gray-400 uppercase text-[10px]">Payer:</span> <span>{payment.tenant_name}</span></div>
          <div className="flex justify-between text-sm font-bold"><span className="text-gray-400 uppercase text-[10px]">Amount:</span> <span className="text-blue-600">₨ {parseFloat(payment.amount).toLocaleString()}</span></div>
          <div className="flex justify-between text-sm font-bold"><span className="text-gray-400 uppercase text-[10px]">TXN ID:</span> <span className="font-mono text-xs">{payment.transaction_id}</span></div>
        </div>
        <textarea
          className="w-full p-4 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500 text-sm min-h-[80px] bg-gray-50"
          placeholder="Admin notes (optional)..."
          value={adminNotes}
          onChange={(e) => setAdminNotes(e.target.value)}
        />
        <div className="flex gap-3">
          <button onClick={closeModal} className="flex-1 py-3 px-4 rounded-xl border font-bold text-sm hover:bg-gray-50 transition-all">Cancel</button>
          <button onClick={() => handleVerify(payment.payment_id, 'verified')} className="flex-[2] py-3 px-4 rounded-xl bg-blue-600 text-white font-black text-sm shadow-lg hover:bg-blue-700 transition-all">Approve & Verify</button>
        </div>
      </div>
    </div>
  </div>
);

export default PaymentVerification;