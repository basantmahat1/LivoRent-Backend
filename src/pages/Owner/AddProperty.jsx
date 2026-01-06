// ==============================
// pages/AddProperty.jsx
// ==============================
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import PropertyForm from '../../components/Form/PropertyForm';

const AddProperty = () => {
  const [searchParams] = useSearchParams();
  const propertyId = searchParams.get('id');

  return (
    <div className="max-w-6xl mx-auto p-4">
      <PropertyForm editId={propertyId} />
    </div>
  );
};

export default AddProperty;