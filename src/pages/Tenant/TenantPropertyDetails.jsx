import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { propertyAPI, bookingAPI, wishlistAPI } from '../../services/api';

const TenantPropertyDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const passed = location.state?.property;

  const [property, setProperty] = useState(passed || null);
  const [loading, setLoading] = useState(!passed);
  const [booked, setBooked] = useState(false);
  const [inWishlist, setInWishlist] = useState(property?.inWishlist || false);

  useEffect(() => {
    if (property) return;
    const load = async () => {
      setLoading(true);
      try {
        const res = await propertyAPI.getById(id);
        setProperty(res.data || res);
      } catch (err) {
        console.error('Failed to fetch property', err);
      } finally { setLoading(false); }
    };
    load();
  }, [id]);

  const handleBook = async () => {
    // Basic booking placeholder - open booking flow or call bookingAPI
    try {
      const data = { property_id: id, start_date: null, end_date: null, tenant_id: JSON.parse(localStorage.getItem('user'))?.id };
      await bookingAPI.create(data);
      setBooked(true);
      alert('Booking placed (placeholder)');
    } catch (err) {
      alert('Booking failed');
      console.error(err);
    }
  };

  const toggleWishlist = async () => {
    try {
      // try add/remove endpoints
      if (inWishlist) {
        await wishlistAPI.remove(property.id);
        setInWishlist(false);
      } else {
        await wishlistAPI.add(property.id);
        setInWishlist(true);
      }
    } catch (err) {
      console.error('Wishlist toggle failed', err);
    }
  };

  if (loading) return <div className="h-48 bg-white rounded-lg animate-pulse" />;
  if (!property) return <div className="p-6 bg-white rounded-lg">Property not found</div>;

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-4">
      <div className="flex gap-6 flex-col md:flex-row">
        <div className="w-full md:w-1/3">
          <img src={property.primary_image || (property.images && property.images[0])} alt={property.title} className="w-full h-56 object-cover rounded-lg" onError={(e)=>e.target.src='https://via.placeholder.com/600x400'} />
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold">{property.title}</h2>
          <p className="text-sm text-gray-600">📍 {property.address}, {property.city}</p>
          <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
            <div className="p-3 bg-gray-50 rounded">🛏 {property.bedrooms} Bed</div>
            <div className="p-3 bg-gray-50 rounded">🚿 {property.bathrooms} Bath</div>
            <div className="p-3 bg-gray-50 rounded">💰 रु {property.price}</div>
          </div>

          <div className="mt-4 flex gap-3">
            {!booked ? (
              <button onClick={handleBook} className="px-5 py-2 rounded-lg bg-[#00BFA5] text-white font-bold">Book Now</button>
            ) : (
              <button className="px-5 py-2 rounded-lg bg-gray-100">Booked</button>
            )}

            <button onClick={toggleWishlist} className="px-4 py-2 rounded-lg border">
              {inWishlist ? 'Remove Wishlist' : 'Add to Wishlist'}
            </button>

            {booked && (
              <button className="px-4 py-2 rounded-lg bg-blue-600 text-white">Go to Payment</button>
            )}
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-semibold">Description</h3>
        <p className="text-gray-700 mt-2">{property.description || 'No description provided.'}</p>
      </div>

      <div>
        <h3 className="font-semibold">Amenities</h3>
        <div className="mt-2 flex flex-wrap gap-2">
          {(property.amenities || []).map((a, i) => (
            <span key={i} className="px-2 py-1 bg-gray-50 rounded text-sm">{a}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TenantPropertyDetails;
