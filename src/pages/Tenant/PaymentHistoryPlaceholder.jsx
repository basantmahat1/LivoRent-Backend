import React from 'react';

const PaymentHistoryPlaceholder = () => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-4">Payment History</h2>
      <p className="text-gray-600">This section will show past payments and receipts. (Placeholder)</p>

      <div className="mt-6 space-y-4">
        {[1,2,3].map(i => (
          <div key={i} className="p-4 border rounded flex justify-between items-center">
            <div>
              <div className="font-semibold">Payment #{1000 + i}</div>
              <div className="text-sm text-gray-500">Property: Sample Property</div>
            </div>
            <div className="text-right">
              <div className="font-bold">Rs. 12,000</div>
              <div className="text-sm text-gray-500">2025-12-01</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PaymentHistoryPlaceholder;
