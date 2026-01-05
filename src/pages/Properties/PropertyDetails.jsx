import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../../components/Layout/Navbar';
import MapView from '../../components/Map/MapView';
import { propertyAPI, bookingAPI, wishlistAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { ShareAltOutlined, MessageOutlined } from '@ant-design/icons';
import RoutingMap from '../../components/Map/RoutingMap';

const PropertyDetails = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [allImages, setAllImages] = useState([]);
  const [mapView, setMapView] = useState('simple');
  const [bookingData, setBookingData] = useState({
    start_date: '',
    end_date: '',
    message: ''
  });

  useEffect(() => {
    loadProperty();
  }, [id]);

  const loadProperty = async () => {
    try {
      const response = await propertyAPI.getById(id);
      const propertyData = response.data.property;
      setProperty(propertyData);
      setInWishlist(propertyData.inWishlist);
      const processedImages = processImages(propertyData);
      setAllImages(processedImages);
    } catch (error) {
      console.error('Error loading property:', error);
      alert('Property not found');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const processImages = (propertyData) => {
    const images = [];
    
    if (propertyData.primary_image) {
      if (typeof propertyData.primary_image === "string" && propertyData.primary_image.trim() !== "") {
        images.push(propertyData.primary_image);
      } else if (typeof propertyData.primary_image === "object" && propertyData.primary_image !== null && propertyData.primary_image.url) {
        images.push(propertyData.primary_image.url);
      }
    }

    let imagesArray = propertyData.images;
    if (typeof imagesArray === 'string') {
      try {
        imagesArray = JSON.parse(imagesArray);
      } catch (e) {
        imagesArray = [];
      }
    }

    if (Array.isArray(imagesArray) && imagesArray.length > 0) {
      imagesArray.forEach((img) => {
        if (typeof img === "string" && img.trim() !== "") {
          images.push(img);
        } else if (typeof img === "object" && img !== null && img.url) {
          images.push(img.url);
        }
      });
    }

    const uniqueImages = [...new Set(images)];
    if (uniqueImages.length === 0) {
      return ["https://via.placeholder.com/1200x600/cccccc/969696?text=No+Property+Images"];
    }
    return uniqueImages;
  };

  const handleWishlistToggle = async () => {
    if (!isAuthenticated || user.role !== 'tenant') {
      navigate('/login', {
        state: {
          from: `/properties/${id}`,
          message: 'Please login as tenant to add to wishlist'
        }
      });
      return;
    }

    try {
      if (inWishlist) {
        await wishlistAPI.remove(property.id);
        setInWishlist(false);
        alert('Removed from wishlist');
      } else {
        await wishlistAPI.add(property.id);
        setInWishlist(true);
        alert('Added to wishlist');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Error updating wishlist');
    }
  };

  const handleBookingClick = () => {
    if (!isAuthenticated || user.role !== 'tenant') {
      navigate('/login', {
        state: {
          redirectTo: '/tenant/dashboard',
          propertyData: {
            id: property.id,
            title: property.title,
            price: property.price,
            address: property.address,
            city: property.city,
            primary_image: property.primary_image,
            bedrooms: property.bedrooms,
            bathrooms: property.bathrooms,
            owner_name: property.owner_name,
            description: property.description
          },
          bookingDetails: bookingData,
          message: 'Please login as tenant to book this property'
        }
      });
      return;
    }
    setShowBookingModal(true);
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated || user.role !== 'tenant') {
      navigate('/login', {
        state: {
          redirectTo: '/tenant/dashboard',
          propertyData: {
            id: property.id,
            title: property.title,
            price: property.price,
            address: property.address,
            city: property.city,
            primary_image: property.primary_image,
            bedrooms: property.bedrooms,
            bathrooms: property.bathrooms,
            owner_name: property.owner_name,
            description: property.description
          },
          bookingDetails: bookingData,
          message: 'Please login as tenant to book'
        }
      });
      return;
    }

    try {
      const response = await bookingAPI.create({
        property_id: property.id,
        ...bookingData
      });
      const bookingId = response.data.booking.id;
      alert('Booking request sent successfully! Redirecting to payment...');
      setShowBookingModal(false);
      navigate(`/tenant/payment/${bookingId}`);
    } catch (error) {
      alert(error.response?.data?.message || 'Booking failed');
    }
  };

  const handleWhatsAppContact = () => {
    if (!property.owner_phone) {
      alert('Owner phone number not available');
      return;
    }

    const message = `Hi, I'm interested in your property: ${property.title}\nPrice: $${property.price}/month\nLocation: ${property.address}, ${property.city}\n\nView property: ${window.location.href}`;
    const phone = property.owner_phone.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleShare = () => {
    const shareUrl = window.location.href;
    const shareText = `Check out this ${property.property_type} in ${property.city} for $${property.price}/month`;

    if (navigator.share) {
      navigator.share({
        title: property.title,
        text: shareText,
        url: shareUrl
      }).catch(err => console.log('Share cancelled:', err));
    } else {
      navigator.clipboard.writeText(shareUrl)
        .then(() => alert('Link copied to clipboard!'))
        .catch(err => console.error('Copy failed:', err));
    }
  };

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const today = new Date().toISOString().split('T')[0];

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg font-medium">Loading property details...</p>
          </div>
        </div>
      </>
    );
  }

  if (!property) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Property Not Found</h2>
            <p className="text-gray-600 mb-6">The property you're looking for doesn't exist.</p>
            <button
              onClick={() => navigate('/')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              Browse Properties
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        {/* Header Section */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Properties
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Title & Location */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">{property.title}</h1>
            <div className="flex items-center gap-6 flex-wrap">
              <div className="flex items-center text-gray-600">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{property.address}, {property.city}</span>
              </div>
              {property.avg_rating && property.avg_rating > 0 && (
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="font-semibold text-gray-900">{property.avg_rating.toFixed(1)}</span>
                  <span className="text-gray-600">({property.total_reviews || 0} reviews)</span>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Images & Details */}
            <div className="lg:col-span-2">
              {/* Image Gallery */}
              <div className="mb-8">
                <div className="relative rounded-xl overflow-hidden mb-4 bg-gray-200 aspect-video shadow-lg">
                  <img
                    src={allImages[selectedImage]}
                    alt={`${property.title} - Image ${selectedImage + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/1200x675/cccccc/969696?text=Image+Not+Available';
                      e.target.onerror = null;
                    }}
                  />
                  
                  {allImages.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full w-12 h-12 flex items-center justify-center shadow-lg transition-all hover:scale-110"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full w-12 h-12 flex items-center justify-center shadow-lg transition-all hover:scale-110"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                      
                      <button
                        onClick={handleWishlistToggle}
                        className="absolute top-4 right-4 bg-white rounded-full p-3 shadow-lg hover:scale-110 transition-transform"
                      >
                        <svg className={`w-6 h-6 ${inWishlist ? 'fill-red-500 text-red-500' : 'text-gray-700'}`} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </button>
                      
                      <button
                        onClick={handleShare}
                        className="absolute top-4 left-4 bg-white rounded-full p-3 shadow-lg hover:scale-110 transition-transform"
                      >
                        <ShareAltOutlined className="text-lg text-gray-700" />
                      </button>
                      
                      <div className="absolute bottom-4 right-4 bg-black/70 text-white px-4 py-2 rounded-full text-sm font-medium">
                        {selectedImage + 1} / {allImages.length}
                      </div>
                    </>
                  )}
                </div>
                
                {allImages.length > 1 && (
                  <div className="grid grid-cols-6 gap-2">
                    {allImages.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedImage(i)}
                        className={`rounded-lg overflow-hidden aspect-square transition-all ${
                          selectedImage === i ? 'ring-2 ring-blue-600 ring-offset-2' : 'opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={img}
                          alt={`Thumbnail ${i + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/200x150/cccccc/969696?text=No+Image';
                            e.target.onerror = null;
                          }}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Property Details */}
              <div className="bg-white rounded-xl p-8 shadow-sm mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Property Details</h2>
                
                <div className="grid grid-cols-4 gap-6 mb-8">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <svg className="w-6 h-6 text-gray-700 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <div className="text-sm text-gray-600 mb-1">Bedrooms</div>
                    <div className="font-semibold text-gray-900">{property.bedrooms}</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <svg className="w-6 h-6 text-gray-700 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                    </svg>
                    <div className="text-sm text-gray-600 mb-1">Bathrooms</div>
                    <div className="font-semibold text-gray-900">{property.bathrooms}</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <svg className="w-6 h-6 text-gray-700 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                    <div className="text-sm text-gray-600 mb-1">Area</div>
                    <div className="font-semibold text-gray-900">{property.area_sqft} Sq Ft</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <svg className="w-6 h-6 text-gray-700 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <div className="text-sm text-gray-600 mb-1">Type</div>
                    <div className="font-semibold text-gray-900 capitalize">{property.property_type}</div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <h3 className="font-semibold text-gray-900 mb-4 text-lg">Description</h3>
                  <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                    {property.description || 'No description available.'}
                  </p>
                </div>
              </div>

              {/* Amenities */}
              {property.amenities && property.amenities.length > 0 && (
                <div className="bg-white rounded-xl p-8 shadow-sm mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Amenities</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {Array.isArray(property.amenities) && property.amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm text-gray-700 capitalize">{amenity.replace(/_/g, ' ')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Map Section */}
              {property.latitude && property.longitude && (
                <div className="bg-white rounded-xl p-8 shadow-sm">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Location & Navigation</h2>
                  <p className="text-sm text-gray-600 mb-6">
                    Coordinates: {parseFloat(property.latitude).toFixed(6)}, {parseFloat(property.longitude).toFixed(6)}
                  </p>

                  <div className="flex gap-3 mb-6">
                    <button
                      onClick={() => setMapView('simple')}
                      className={`flex-1 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                        mapView === 'simple'
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      View Location
                    </button>
                    <button
                      onClick={() => setMapView('routing')}
                      className={`flex-1 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                        mapView === 'routing'
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Get Directions
                    </button>
                  </div>

                  <div className="rounded-lg overflow-hidden shadow-md border border-gray-200">
                    {mapView === 'simple' ? (
                      <MapView
                        properties={[property]}
                        center={[parseFloat(property.latitude), parseFloat(property.longitude)]}
                        zoom={15}
                      />
                    ) : (
                      <RoutingMap
                        destination={[parseFloat(property.latitude), parseFloat(property.longitude)]}
                        propertyTitle={property.title}
                      />
                    )}
                  </div>

                  <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <div>
                        {mapView === 'simple' ? (
                          <>
                            <strong>Viewing property location</strong>
                            <p className="mt-1">Click the marker for details. Use zoom controls to explore the area.</p>
                          </>
                        ) : (
                          <>
                            <strong>Get Directions:</strong>
                            <p className="mt-1">Click "Get Directions" button on the map, allow location access, choose travel mode, and view your route.</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Booking Card */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl p-6 shadow-lg sticky top-24 border border-gray-200">
                <div className="mb-6">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-4xl font-bold text-gray-900">${property.price}</span>
                    <span className="text-gray-600">/month</span>
                  </div>
                  {property.is_verified && (
                    <div className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded text-xs font-semibold mt-2">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Verified Property
                    </div>
                  )}
                </div>

                {/* Property Stats */}
                <div className="grid grid-cols-2 gap-3 mb-6 pb-6 border-b border-gray-200">
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-gray-900">{property.view_count || 0}</div>
                    <div className="text-xs text-gray-600 font-medium">Views</div>
                  </div>
                  {property.furnishing && (
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <div className="text-sm font-bold text-gray-900 capitalize">{property.furnishing}</div>
                      <div className="text-xs text-gray-600 font-medium">Furnishing</div>
                    </div>
                  )}
                </div>

                {/* Owner Info */}
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Property Owner</h3>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {property.owner_name?.charAt(0).toUpperCase() || 'O'}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{property.owner_name || 'Owner'}</div>
                      {property.owner_verified && (
                        <div className="text-xs text-green-600 font-semibold">✓ Verified</div>
                      )}
                    </div>
                  </div>
                  
                  {isAuthenticated && user?.role === 'tenant' && (
                    <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-yellow-800">
                      Contact details available after payment verification
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  {isAuthenticated && user?.role === 'tenant' ? (
                    <>
                      <button
                        onClick={handleBookingClick}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors shadow-md"
                      >
                        {property.instant_booking ? 'Book Instantly' : 'Request Booking'}
                      </button>
                      <button
                        onClick={handleWishlistToggle}
                        className={`w-full font-semibold py-3 rounded-lg transition-colors border-2 ${
                          inWishlist
                            ? 'bg-red-50 text-red-600 border-red-300 hover:bg-red-100'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {inWishlist ? '❤️ Saved' : '🤍 Save'}
                      </button>
                    </>
                  ) : !isAuthenticated ? (
                    <button
                      onClick={handleBookingClick}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors shadow-md"
                    >
                      Login to Book
                    </button>
                  ) : (
                    <div className="bg-gray-100 text-gray-600 text-center py-3 rounded-lg border border-gray-300 text-sm">
                      Only tenants can book properties
                    </div>
                  )}

                  {property.owner_phone && (!isAuthenticated || user?.role !== 'tenant') && (
                    <button
                      onClick={handleWhatsAppContact}
                      className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <MessageOutlined />
                      WhatsApp Owner
                    </button>
                  )}

                  <button
                    onClick={handleShare}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 border border-gray-300"
                  >
                    <ShareAltOutlined />
                    Share Property
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Modal */}
        {showBookingModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="bg-blue-600 text-white p-6 rounded-t-2xl flex justify-between items-center">
                <h2 className="text-2xl font-bold">Book This Property</h2>
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="text-white hover:text-gray-200 text-3xl font-bold"
                >
                  ×
                </button>
              </div>

              <div className="p-6">
                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                  <h3 className="font-bold text-gray-900 mb-2">{property.title}</h3>
                  <p className="text-blue-600 font-bold text-xl">${property.price}/month</p>
                  <p className="text-gray-600 text-sm mt-1">📍 {property.address}, {property.city}</p>
                </div>

                <form onSubmit={handleBooking} className="space-y-4">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Move-in Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      min={today}
                      value={bookingData.start_date}
                      onChange={(e) => setBookingData({...bookingData, start_date: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Expected End Date
                    </label>
                    <input
                      type="date"
                      min={bookingData.start_date || today}
                      value={bookingData.end_date}
                      onChange={(e) => setBookingData({...bookingData, end_date: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    />
                    <p className="text-xs text-gray-500 mt-1">Optional - Leave empty for long-term rental</p>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Message to Owner
                    </label>
                    <textarea
                      rows="4"
                      value={bookingData.message}
                      onChange={(e) => setBookingData({...bookingData, message: e.target.value})}
                      placeholder="Introduce yourself and mention any special requirements..."
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all resize-none"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowBookingModal(false)}
                      className="flex-1 bg-white hover:bg-gray-100 text-gray-700 font-semibold py-3 rounded-lg border-2 border-gray-300 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg shadow-lg transition-all"
                    >
                      {property.instant_booking ? 'Confirm Booking' : 'Send Request'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default PropertyDetails;