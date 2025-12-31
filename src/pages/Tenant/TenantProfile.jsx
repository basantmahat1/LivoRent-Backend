import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const TenantProfile = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-6 mb-6">
          <div className="w-24 h-24 rounded-lg bg-[var(--color-primary)] flex items-center justify-center text-white text-3xl font-bold">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <h2 className="text-3xl font-bold text-[var(--color-primary)]">{user?.name}</h2>
            <p className="text-gray-600">{user?.email}</p>
            <p className="text-sm text-gray-500 mt-2">Tenant Member</p>
          </div>
        </div>

        <hr className="my-6" />

        <h3 className="text-xl font-bold mb-4">Account Information</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center py-3 border-b">
            <span className="text-gray-600">Full Name</span>
            <span className="font-semibold">{user?.name}</span>
          </div>
          <div className="flex justify-between items-center py-3 border-b">
            <span className="text-gray-600">Email Address</span>
            <span className="font-semibold">{user?.email}</span>
          </div>
          <div className="flex justify-between items-center py-3 border-b">
            <span className="text-gray-600">Phone Number</span>
            <span className="font-semibold">{user?.phone || 'Not provided'}</span>
          </div>
          <div className="flex justify-between items-center py-3">
            <span className="text-gray-600">Account Type</span>
            <span className="font-semibold text-[var(--color-primary)]">Tenant</span>
          </div>
        </div>

        <div className="mt-8 flex gap-3">
          <button className="px-6 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 font-semibold">
            Edit Profile
          </button>
          <Link to="/tenant/change-password">
            <button className="px-6 py-2 rounded-lg bg-[var(--color-primary)] text-white hover:brightness-110 font-semibold">
              Change Password
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TenantProfile;
