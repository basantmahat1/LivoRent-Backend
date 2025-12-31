import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';

const TenantDashboard = () => {
  const { user } = useAuth();
  const location = useLocation();
  
  const [testResult, setTestResult] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Get property data from location state (after booking)
  const propertyData = location.state?.propertyData;
  const bookingDetails = location.state?.bookingDetails;

  const testTenantAPI = async () => {
    setLoading(true);
    try {
      const response = await authAPI.testTenant();
      setTestResult(`API Test Successful: ${response.data.message}`);
    } catch (error) {
      setTestResult(`API Test Failed: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* If property data passed from booking, show property booking details */}
      {propertyData && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-start gap-6">
            {/* Property Image */}
            <div className="flex-shrink-0">
              <img
                src={propertyData.primary_image}
                alt={propertyData.title}
                className="w-48 h-40 object-cover rounded-lg shadow"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/300x200/cccccc/969696?text=Property';
                }}
              />
            </div>

            {/* Property Details */}
            <div className="flex-grow">
              <h2 className="text-2xl font-bold mb-2" style={{color: 'var(--color-primary)'}}>{propertyData.title}</h2>
              <p className="text-gray-600 mb-4">📍 {propertyData.address}, {propertyData.city}</p>
              
              <div className="grid grid-cols-4 gap-4 mb-4">
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                  <div className="font-bold text-lg" style={{color: 'var(--color-primary)'}}>{propertyData.bedrooms}</div>
                  <div className="text-xs text-gray-600">Bedrooms</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                  <div className="font-bold text-lg" style={{color: 'var(--color-primary)'}}>{propertyData.bathrooms}</div>
                  <div className="text-xs text-gray-600">Bathrooms</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                  <div className="font-bold text-lg" style={{color: 'var(--color-accent)'}}>रु {propertyData.price}</div>
                  <div className="text-xs text-gray-600">Per month</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                  <div className="font-bold text-lg">{propertyData.owner_name}</div>
                  <div className="text-xs text-gray-600">Owner</div>
                </div>
              </div>

              {/* Booking Details */}
              {bookingDetails && (
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                  <h3 className="font-bold mb-2" style={{color: 'var(--color-primary)'}}>📅 Your Booking Details</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Move-in Date:</span>
                      <p className="font-semibold">{bookingDetails.start_date || 'Not set'}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Expected End Date:</span>
                      <p className="font-semibold">{bookingDetails.end_date || 'Not specified'}</p>
                    </div>
                    {bookingDetails.message && (
                      <div className="col-span-2">
                        <span className="text-gray-600">Message to Owner:</span>
                        <p className="font-semibold">{bookingDetails.message}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="mt-4">
                <button 
                  onClick={() => window.location.reload()}
                  className="px-6 py-2 rounded-lg font-semibold"
                  style={{backgroundColor: 'var(--color-primary)', color: 'white'}}
                >
                  Proceed to Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Default Dashboard content */}
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome, {user?.name} 👋
        </h1>
        <p className="text-gray-600">
          Tenant Dashboard | Find your perfect rental property
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Stats Cards */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-100 p-3 rounded-lg">
              <span className="text-2xl">🔍</span>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Active Searches</h3>
              <p className="text-3xl font-bold text-blue-600">12</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-100 p-3 rounded-lg">
              <span className="text-2xl">❤️</span>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Saved Properties</h3>
              <p className="text-3xl font-bold text-green-600">8</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-purple-100 p-3 rounded-lg">
              <span className="text-2xl">📅</span>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Bookings</h3>
              <p className="text-3xl font-bold text-purple-600">3</p>
            </div>
          </div>
        </div>
      </div>

      {/* API Test Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">API Test</h2>
        <button
          onClick={testTenantAPI}
          disabled={loading}
          className="btn-primary mb-4"
        >
          {loading ? 'Testing...' : 'Test Tenant API Access'}
        </button>
        {testResult && (
          <div className={`p-3 rounded-lg ${
            testResult.includes('Successful') 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {testResult}
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-3">
          {[
            { id: 1, activity: 'Viewed Luxury Apartment in Downtown', time: '2 hours ago' },
            { id: 2, activity: 'Saved Modern Studio in Central Park', time: '1 day ago' },
            { id: 3, activity: 'Booked viewing for Family House', time: '3 days ago' },
          ].map((item) => (
            <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span>{item.activity}</span>
              <span className="text-sm text-gray-500">{item.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TenantDashboard;