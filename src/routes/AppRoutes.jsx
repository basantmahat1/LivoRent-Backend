import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../routes/ProtectedRoute';
import TenantProtectedRoute from '../routes/TenantProtectedRoute';

// Public Pages
import Home from '../pages/Home';
import AdminLogin from '../pages/Admin/AdminLogin';
import Login from '../components/Auth/Login';
import Signup from '../pages/Signup';
import PropertyDetails from '../pages/Properties/PropertyDetails';
import PropertyMapPage from '../pages/PropertyMapPage';
import AllPropertiesPage from '../pages/AllPropertiesPage';
import FAQ from '../pages/FAQ';
import MainLayout from '../components/Layout/MainLayout';

// Tenant Pages
import TenantHome from '../pages/Tenant/TenantHome';
import TenantPropertyDetails from '../pages/Tenant/TenantPropertyDetails';
import TenantProfile from '../pages/Tenant/TenantProfile';
import MyBookings from '../pages/Tenant/MyBookings';
import MyWishlist from '../pages/Tenant/MyWishlist';
import PaymentPage from '../pages/Tenant/PaymentPage';
import PaymentHistoryPlaceholder from '../pages/Tenant/PaymentHistoryPlaceholder';
import ChangePassword from '../pages/Tenant/ChangePassword';


// Owner Pages
import OwnerDashboard from '../pages/Owner/OwnerDashboard';
import OwnerProperties from '../pages/Owner/OwnerProperties';
import AddProperty from '../pages/Owner/AddProperty';
import ManageBookings from '../pages/Owner/ManageBookings';

// Admin Pages
import AdminDashboard from '../pages/Admin/AdminDashboard';
import AdminUsers from '../pages/Admin/AdminUsers';
import AdminProperties from '../pages/Admin/AdminProperties';
import AdminDeletedProperties from '../pages/Admin/AdminDeletedProperties';
import AdminSettings from '../pages/Admin/AdminSettings';
import PaymentVerification from '../pages/Admin/PaymentVerification';

// import LoginPage from '../pages/Auth/LoginPage';
// import { Footer } from 'antd/es/layout/layout';

const AppRoutes = () => {
  
  return (
    <Routes>
      {/* ================== PUBLIC ROUTES ================== */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/properties/:id" element={<PropertyDetails />} />
        <Route path="/allproperties" element={<AllPropertiesPage />} />
        <Route path="/faq" element={<FAQ />} />
      </Route>

      <Route path="/admin-login" element={<AdminLogin />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/properties/:id/map" element={<PropertyMapPage />} />

      {/* ================== TENANT ROUTES ================== */}
      <Route path="/tenant" element={<TenantProtectedRoute />}> 
        <Route index element={<TenantHome />} />
        <Route path="profile" element={<TenantProfile />} />
        <Route path="bookings" element={<MyBookings />} />
        <Route path="wishlist" element={<MyWishlist />} />
        <Route path="payments" element={<PaymentHistoryPlaceholder />} />
        <Route path="property/:id" element={<TenantPropertyDetails />} />
        <Route path="payment/:bookingId" element={<PaymentPage />} />
        <Route path="change-password" element={<ChangePassword />} />
      </Route>

      {/* ================== OWNER ROUTES ================== */}
      <Route element={<ProtectedRoute allowedRoles={['owner']} />}>
        <Route path="/owner/dashboard" element={<OwnerDashboard />} />
        <Route path="/owner/properties" element={<OwnerProperties />} />
        <Route path="/owner/add-property" element={<AddProperty />} />
        <Route path="/owner/bookings" element={<ManageBookings />} />
      </Route>

      {/* ================== ADMIN ROUTES ================== */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/properties" element={<AdminProperties />} />
        <Route path="/admin/properties/deleted-drafts" element={<AdminDeletedProperties />} />
        <Route path="/admin/add-property" element={<AddProperty />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
        <Route path="/admin/payment-status" element={<PaymentVerification />} />
        <Route path="/admin/payments" element={<PaymentVerification />} />

      </Route>

      {/* ================== FALLBACK ROUTE ================== */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
