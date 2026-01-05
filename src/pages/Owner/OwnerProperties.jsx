import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { propertyAPI } from '../../services/api';

const OwnerProperties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      const response = await propertyAPI.getOwnerProperties();
      setProperties(response.data.properties);
    } catch (error) {
      console.error('Error loading properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this property?')) return;

    try {
      await propertyAPI.delete(id);
      setProperties(properties.filter((p) => p.id !== id));
      alert('Property deleted successfully');
    } catch (error) {
      alert('Failed to delete property');
    }
  };

  const toggleAvailability = async (id, currentStatus) => {
    try {
      await propertyAPI.update(id, { is_available: !currentStatus });
      setProperties(
        properties.map((p) =>
          p.id === id ? { ...p, is_available: !currentStatus } : p
        )
      );
    } catch (error) {
      alert('Failed to update availability');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="spinner h-16 w-16 mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium text-lg">Loading properties...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-[var(--color-primary)]">
            My Properties
          </h1>
          <p className="text-gray-500 mt-2 text-lg">
            Manage and track your rental properties easily
          </p>
        </div>
        <Link
          to="/owner/add-property"
          className="btn-primary flex items-center gap-2 px-6 py-3 shadow-md hover:shadow-lg transition-all font-semibold"
        >
          <span className="text-xl">➕</span>
          Add New Property
        </Link>
      </div>

      {/* Empty State */}
      {properties.length === 0 ? (
        <div className="card p-16 text-center border border-gray-200 rounded-xl shadow-sm">
          <div className="text-9xl mb-6 animate-bounce">🏠</div>
          <h2 className="text-3xl font-bold text-[var(--color-primary)] mb-3">
            No properties yet
          </h2>
          <p className="text-gray-500 mb-8 text-lg">
            Start by adding your first property to rent out!
          </p>
          <Link
            to="/owner/add-property"
            className="btn-primary inline-flex items-center gap-2 px-6 py-3 shadow-md hover:shadow-lg transition-all font-semibold"
          >
            <span className="text-xl">➕</span>
            Add Your First Property
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {properties.map((property) => (
            <div
              key={property.id}
              className="card border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all bg-white"
            >
              <div className="md:flex">
                {/* Property Image */}
                <div className="md:w-80 h-56 md:h-auto relative overflow-hidden">
                  <img
                    src={property.primary_image || '/placeholder.jpg'}
                    alt={property.title}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                  {property.is_verified && (
                    <span className="absolute top-3 right-3 bg-[var(--color-success)] text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
                      <span>✓</span> Verified
                    </span>
                  )}
                </div>

                {/* Property Details */}
                <div className="flex-1 p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-[var(--color-primary)] mb-2">
                          {property.title}
                        </h3>
                        <p className="text-gray-500 flex items-center gap-2">
                          <span>📍</span>
                          {property.address}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="price-tag text-[var(--color-secondary)] text-2xl font-bold">
                          ${property.price}
                        </div>
                        <div className="text-sm text-gray-400">per month</div>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="bg-gray-50 p-3 rounded-lg text-center">
                        <div className="text-xs text-gray-400 mb-1">Type</div>
                        <div className="font-semibold text-[var(--color-primary)] capitalize">
                          {property.property_type}
                        </div>
                      </div>
                      <div className="bg-blue-50 p-3 rounded-lg text-center">
                        <div className="text-xs text-blue-400 mb-1">Views</div>
                        <div className="font-bold text-blue-600">{property.view_count || 0}</div>
                      </div>
                      <div className="bg-yellow-50 p-3 rounded-lg text-center">
                        <div className="text-xs text-yellow-400 mb-1">Pending</div>
                        <div className="font-bold text-yellow-600">{property.pending_bookings || 0}</div>
                      </div>
                      <div className="bg-green-50 p-3 rounded-lg text-center">
                        <div className="text-xs text-green-400 mb-1">Active</div>
                        <div className="font-bold text-green-600">{property.active_bookings || 0}</div>
                      </div>
                    </div>

                    {/* Status Badges */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {property.is_verified && (
                        <span className="badge-success">✓ Verified</span>
                      )}
                      <span
                        className={`${
                          property.is_available ? 'badge-info' : 'badge-danger'
                        }`}
                      >
                        {property.is_available ? 'Available' : 'Not Available'}
                      </span>
                      {property.instant_booking && (
                        <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-semibold">
                          ⚡ Instant Booking
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3 mt-4">
                    <Link
                      to={`/properties/${property.id}`}
                      className="px-5 py-2.5 border-2 border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-all flex items-center gap-2"
                    >
                      <span>👁</span> View
                    </Link>
                    <Link
                      to={`/owner/properties/${property.id}/edit`}
                      className="btn-primary flex items-center gap-2 px-5 py-2.5 font-semibold"
                    >
                      <span>✏️</span> Edit
                    </Link>
                    <button
                      onClick={() => toggleAvailability(property.id, property.is_available)}
                      className={`px-5 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
                        property.is_available
                          ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                          : 'bg-green-500 text-white hover:bg-green-600'
                      }`}
                    >
                      <span>{property.is_available ? '🔒' : '✓'}</span>
                      {property.is_available ? 'Mark Unavailable' : 'Mark Available'}
                    </button>
                    <button
                      onClick={() => handleDelete(property.id)}
                      className="btn-danger flex items-center gap-2 px-5 py-2.5 font-semibold"
                    >
                      <span>🗑️</span> Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OwnerProperties;
