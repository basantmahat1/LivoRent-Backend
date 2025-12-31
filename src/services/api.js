// ========================================
// services/api.js (UPDATED - Complete API Service)
// ========================================
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken } = response.data;
        localStorage.setItem('accessToken', accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  signup: (userData) => api.post('/auth/signup', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  // In services/api.js
adminLogin: (credentials) => api.post('/auth/admin/login', credentials),
  getProfile: () => api.get('/auth/profile'),
  logout: () => api.post('/auth/logout'),
  testTenant: () => api.get('/auth/tenant'),
  testOwner: () => api.get('/auth/owner'),
  testAdmin: () => api.get('/auth/admin'),
};

// Property API
export const propertyAPI = {
  getAll: (params) => api.get('/properties', { params }),
  getById: (id) => api.get(`/properties/${id}`),
  getFeatured: () => api.get('/properties/featured'),
  searchNearby: (params) => api.get('/properties/nearby', { params }),
  getOwnerProperties: () => api.get('/properties/owner/me'),
  create: (formData) => api.post('/properties', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (id, formData) => api.put(`/properties/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete: (id) => api.delete(`/properties/${id}`),
  verify: (id, isVerified) => api.patch(`/properties/${id}/verify`, { is_verified: isVerified }),
  publish: (id) => api.patch(`/properties/${id}/publish`),
  updateStatus: (id, status) => api.patch(`/properties/${id}/status`, { status }),
  getDeleted: (params) => api.get('/properties/deleted-drafts', { params }),
  restore: (id) => api.patch(`/properties/${id}/restore`),
  deletePermanently: (id) => api.delete(`/properties/${id}/permanently`),
};

// Booking API
export const bookingAPI = {
  getAll: (params) => api.get('/bookings', { params }),
  getById: (id) => api.get(`/bookings/${id}`),
  create: (bookingData) => api.post('/bookings', bookingData),
  updateStatus: (id, status) => api.patch(`/bookings/${id}/status`, { status }),
  cancel: (id) => api.delete(`/bookings/${id}`),
  getBookedDates: (propertyId) => api.get(`/bookings/property/${propertyId}/dates`),
};

// Wishlist API
export const wishlistAPI = {
  getAll: () => api.get('/wishlist'),
  add: (propertyId) => api.post('/wishlist', { propertyId }),
  remove: (propertyId) => api.delete(`/wishlist/${propertyId}`),
};

// User API
export const userAPI = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, userData) => api.put(`/users/${id}`, userData),
  verify: (id, isVerified) => api.patch(`/users/${id}/verify`, { is_verified: isVerified }),
  toggleStatus: (id, isActive) => api.patch(`/users/${id}/status`, { is_active: isActive }),
};

// Maps API
export const mapsAPI = {
  geocode: (address) => axios.get(`http://localhost:5000/api/maps/geocode`, {
    params: { address }
  }),
  nearbyPlaces: (latitude, longitude, type) => axios.get(`http://localhost:5000/api/maps/nearby`, {
    params: { latitude, longitude, type }
  }),
};
// frontend/src/services/api.js (ADD THESE TO YOUR EXISTING API FILE)

/// ✅ CORRECT (yo use garnu)
export const paymentAPI = {
  create: (data) => api.post('/payments', data),
  getByBooking: (bookingId) => api.get(`/payments/booking/${bookingId}`),
  getStatus: (paymentId) => api.get(`/payments/status/${paymentId}`),
  submitProof: (data) => api.post('/payments/submit-proof', data),
  getAllPayments: (params) => api.get('/payments/admin/all', { params }),
  verifyPayment: (paymentId, data) => api.patch(`/payments/admin/verify/${paymentId}`, data)
};
export default api;
