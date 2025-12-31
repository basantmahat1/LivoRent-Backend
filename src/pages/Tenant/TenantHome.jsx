import React, { useEffect, useState } from 'react';
import { propertyAPI } from '../../services/api';
import PropertyCard from '../Properties/PropertyCard';
import { useNavigate } from 'react-router-dom';

const TenantHome = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await propertyAPI.getAll({ limit: 12, offset: 0 });
        // propertyAPI.getAll may return different shapes; support both
        const props = res.data?.properties || res.data || [];
        setProperties(props);
      } catch (err) {
        console.error('Failed to load properties', err);
        setProperties([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleCardClick = (property) => {
    // Navigate to nested tenant property route so layout stays
    navigate(`/tenant/property/${property.id}`, { state: { property } });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Available Properties</h2>
        <div className="text-sm text-gray-500">Showing {properties.length} listings</div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="h-56 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map(p => (
            <PropertyCard key={p.id} property={p} onCardClick={handleCardClick} />
          ))}
        </div>
      )}
    </div>
  );
};

export default TenantHome;
