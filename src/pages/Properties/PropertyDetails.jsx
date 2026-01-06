import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import MapView from '../../components/Map/MapView';
import { propertyAPI, bookingAPI, wishlistAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { ShareAltOutlined, MessageOutlined, HeartFilled, HeartOutlined, EnvironmentOutlined, HomeOutlined, ArrowsAltOutlined, CheckCircleOutlined, StarFilled, LeftOutlined } from '@ant-design/icons';
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
      return ["https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=600&q=80"];
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="w-24 h-24 border-4 border-blue-100 rounded-full"></div>
            <div className="absolute top-0 left-0 w-24 h-24 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Loading Property Details</h3>
          <p className="text-gray-500">Please wait while we fetch the perfect home for you...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <HomeOutlined className="text-4xl text-gray-400" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Property Not Found</h2>
          <p className="text-gray-600 mb-8">The property you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Browse Properties
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
      {/* Back Navigation */}
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate(-1)}
              className="group flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors font-medium"
            >
              <LeftOutlined className="group-hover:-translate-x-1 transition-transform" />
              Back to Properties
            </button>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleShare}
                className="p-2 text-gray-600 hover:text-blue-600 transition-colors rounded-lg hover:bg-gray-100"
                title="Share"
              >
                <ShareAltOutlined className="text-lg" />
              </button>
              <button
                onClick={handleWishlistToggle}
                className="p-2 text-gray-600 hover:text-red-500 transition-colors rounded-lg hover:bg-gray-100"
                title="Save to Wishlist"
              >
                {inWishlist ? <HeartFilled className="text-red-500 text-lg" /> : <HeartOutlined className="text-lg" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold capitalize">
                  {property.property_type}
                </span>
                {property.is_verified && (
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold flex items-center gap-1">
                    <CheckCircleOutlined className="text-xs" />
                    Verified
                  </span>
                )}
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3 leading-tight">
                {property.title}
              </h1>
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2 text-gray-600">
                  <EnvironmentOutlined className="text-blue-500" />
                  <span className="font-medium">{property.address}, {property.city}</span>
                </div>
                {property.avg_rating && property.avg_rating > 0 && (
                  <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-full">
                    <StarFilled className="text-yellow-500" />
                    <span className="font-bold text-gray-900">{property.avg_rating.toFixed(1)}</span>
                    <span className="text-gray-600 text-sm">({property.total_reviews || 0} reviews)</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-2xl shadow-xl min-w-[240px]">
              <div className="text-sm text-blue-100 mb-1">Monthly Rent</div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl lg:text-5xl font-bold">${property.price}</span>
                <span className="text-blue-100">/month</span>
              </div>
              {property.instant_booking && (
                <div className="mt-3 text-sm font-semibold text-green-300">✓ Instant Booking Available</div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images & Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 shadow-xl">
                <img
                  src={allImages[selectedImage]}
                  alt={`${property.title} - Image ${selectedImage + 1}`}
                  className="w-full h-[500px] object-cover transition-opacity duration-300"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=600&q=80';
                    e.target.onerror = null;
                  }}
                />
                
                {allImages.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full w-14 h-14 flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 hover:shadow-3xl"
                    >
                      <LeftOutlined className="text-xl" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full w-14 h-14 flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 hover:shadow-3xl"
                    >
                      <LeftOutlined className="text-xl rotate-180" />
                    </button>
                    
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/70 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
                      {selectedImage + 1} / {allImages.length}
                    </div>
                  </>
                )}
              </div>
              
              {allImages.length > 1 && (
                <div className="grid grid-cols-6 gap-3">
                  {allImages.slice(0, 6).map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={`relative rounded-xl overflow-hidden aspect-square transition-all duration-300 ${
                        selectedImage === i 
                          ? 'ring-3 ring-blue-500 ring-offset-2 scale-105' 
                          : 'opacity-80 hover:opacity-100 hover:scale-102'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`Thumbnail ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {selectedImage === i && (
                        <div className="absolute inset-0 bg-blue-500/20"></div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Property Highlights */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <HomeOutlined className="text-blue-500" />
                Property Highlights
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-white rounded-xl border border-blue-100">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <HomeOutlined className="text-2xl text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">{property.bedrooms}</div>
                  <div className="text-gray-600 font-medium">Bedrooms</div>
                </div>
                
                <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-white rounded-xl border border-blue-100">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    {/* <BathOutlined className="text-2xl text-blue-600" /> */}
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">{property.bathrooms}</div>
                  <div className="text-gray-600 font-medium">Bathrooms</div>
                </div>
                
                <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-white rounded-xl border border-blue-100">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ArrowsAltOutlined className="text-2xl text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">{property.area_sqft}</div>
                  <div className="text-gray-600 font-medium">Sq Ft</div>
                </div>
                
                {property.furnishing && (
                  <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-white rounded-xl border border-blue-100">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                    </div>
                    <div className="text-lg font-bold text-gray-900 mb-1 capitalize">{property.furnishing}</div>
                    <div className="text-gray-600 font-medium">Furnishing</div>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-200 pt-8">
                <h3 className="font-bold text-gray-900 mb-4 text-xl">About This Property</h3>
                <p className="text-gray-600 leading-relaxed text-lg whitespace-pre-line">
                  {property.description || 'A beautiful property located in a prime location. Contact owner for more details.'}
                </p>
              </div>
            </div>

            {/* Amenities Section */}
            {property.amenities && property.amenities.length > 0 && (
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Amenities & Features</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Array.isArray(property.amenities) && property.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-blue-50 rounded-xl transition-colors group">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                        <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-gray-700 font-medium capitalize">{amenity.replace(/_/g, ' ')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Map Section */}
            {property.latitude && property.longitude && (
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Location & Navigation</h2>
                    <p className="text-gray-600">
                      {property.address}, {property.city}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setMapView('simple')}
                      className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
                        mapView === 'simple'
                          ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      View Location
                    </button>
                    <button
                      onClick={() => setMapView('routing')}
                      className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
                        mapView === 'routing'
                          ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Get Directions
                    </button>
                  </div>
                </div>

                <div className="rounded-xl overflow-hidden shadow-lg border border-gray-200 h-[400px]">
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

                <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <EnvironmentOutlined className="text-blue-600 text-lg" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-2">
                        {mapView === 'simple' ? 'Property Location' : 'Get Directions'}
                      </h4>
                      <p className="text-gray-600">
                        {mapView === 'simple' 
                          ? 'The property is highlighted on the map. You can zoom in to see nearby amenities and explore the neighborhood.'
                          : 'Enter your starting location in the map to get turn-by-turn directions to this property.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Booking & Owner Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Booking Card */}
            <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 sticky top-24">
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Make a Booking</h3>
                
                <div className="space-y-4">
                  {isAuthenticated && user?.role === 'tenant' ? (
                    <button
                      onClick={handleBookingClick}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      {property.instant_booking ? 'Book Instantly' : 'Request Booking'}
                    </button>
                  ) : !isAuthenticated ? (
                    <button
                      onClick={handleBookingClick}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      Login to Book
                    </button>
                  ) : (
                    <div className="bg-gray-100 text-gray-600 text-center py-4 rounded-xl border border-gray-300 font-medium">
                      Only tenants can book properties
                    </div>
                  )}

                  <button
                    onClick={handleWishlistToggle}
                    className={`w-full font-semibold py-4 rounded-xl transition-all duration-300 border-2 flex items-center justify-center gap-3 ${
                      inWishlist
                        ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {inWishlist ? (
                      <>
                        <HeartFilled className="text-red-500" />
                        Saved to Wishlist
                      </>
                    ) : (
                      <>
                        <HeartOutlined />
                        Save to Wishlist
                      </>
                    )}
                  </button>

                  {property.owner_phone && (!isAuthenticated || user?.role !== 'tenant') && (
                    <button
                      onClick={handleWhatsAppContact}
                      className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-4 rounded-xl transition-all duration-300 shadow-lg flex items-center justify-center gap-3"
                    >
                      <MessageOutlined />
                      WhatsApp Owner
                    </button>
                  )}

                  <button
                    onClick={handleShare}
                    className="w-full bg-white hover:bg-gray-50 text-gray-700 font-semibold py-4 rounded-xl transition-colors border-2 border-gray-200 flex items-center justify-center gap-3"
                  >
                    <ShareAltOutlined />
                    Share Property
                  </button>
                </div>
              </div>

              {/* Owner Info */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="font-bold text-gray-900 mb-4">Property Owner</h3>
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    {property.owner_name?.charAt(0).toUpperCase() || 'O'}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">{property.owner_name || 'Owner'}</div>
                    {property.owner_verified && (
                      <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
                        <CheckCircleOutlined className="text-xs" />
                        Verified Owner
                      </div>
                    )}
                  </div>
                </div>
                
                {isAuthenticated && user?.role === 'tenant' && (
                  <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
                    <div className="flex items-start gap-2">
                      <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <span>Contact details available after payment verification</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Property Stats */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="font-bold text-gray-900 mb-4">Property Stats</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-xl border border-gray-200">
                    <div className="text-2xl font-bold text-gray-900 mb-1">{property.view_count || 0}</div>
                    <div className="text-sm text-gray-600 font-medium">Total Views</div>
                  </div>
                  <div className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-xl border border-gray-200">
                    <div className="text-2xl font-bold text-gray-900 mb-1">{property.total_bookings || 0}</div>
                    <div className="text-sm text-gray-600 font-medium">Bookings</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Info Card */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
              <h3 className="font-bold text-gray-900 mb-4">Need Help?</h3>
              <p className="text-gray-600 mb-4">
                Have questions about this property or the booking process?
              </p>
              <button
                onClick={() => navigate('/contact')}
                className="w-full bg-white hover:bg-gray-50 text-blue-600 font-semibold py-3 rounded-xl border-2 border-blue-200 transition-colors"
              >
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-slideUp">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Book This Property</h2>
                  <p className="text-blue-100 opacity-90">Complete your booking request</p>
                </div>
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="text-white hover:text-gray-200 text-3xl font-bold transition-colors"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-5 mb-6 border border-gray-200">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                    <img
                      src={allImages[0]}
                      alt={property.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 line-clamp-2">{property.title}</h3>
                    <p className="text-blue-600 font-bold text-xl mt-2">${property.price}/month</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleBooking} className="space-y-5">
                <div>
                  <label className="block text-gray-700 font-semibold mb-3">
                    Move-in Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    min={today}
                    value={bookingData.start_date}
                    onChange={(e) => setBookingData({...bookingData, start_date: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-3 focus:ring-blue-200 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-3">
                    Expected End Date
                  </label>
                  <input
                    type="date"
                    min={bookingData.start_date || today}
                    value={bookingData.end_date}
                    onChange={(e) => setBookingData({...bookingData, end_date: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-3 focus:ring-blue-200 transition-all"
                  />
                  <p className="text-xs text-gray-500 mt-2">Optional - Leave empty for long-term rental</p>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-3">
                    Message to Owner
                  </label>
                  <textarea
                    rows="4"
                    value={bookingData.message}
                    onChange={(e) => setBookingData({...bookingData, message: e.target.value})}
                    placeholder="Tell the owner about yourself and your requirements..."
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-3 focus:ring-blue-200 transition-all resize-none"
                  />
                </div>

                <div className="flex gap-4 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowBookingModal(false)}
                    className="flex-1 bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 rounded-xl border-2 border-gray-300 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 rounded-xl shadow-lg transition-all"
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
  );
};

export default PropertyDetails;