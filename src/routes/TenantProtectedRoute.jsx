import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import TenantLayout from '../pages/Tenant/TenantLayout';
import { Spin } from 'antd';

const TenantProtectedRoute = () => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'tenant') return <Navigate to="/" replace />;

  return (
    <TenantLayout>
      <Outlet />
    </TenantLayout>
  );
};

export default TenantProtectedRoute;
