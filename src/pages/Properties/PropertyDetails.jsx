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
      
      // ✅ REDIRECT TO PAYMENT PAGE
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
        {/* <Navbar /> */}
        <div className="min-h-screen flex items-center justify-center" style={{backgroundColor: 'var(--color-bg-light)'}}>
          <div className="text-center">
            <div className="spinner h-16 w-16 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading property details...</p>
          </div>
        </div>
      </>
    );
  }

  if (!property) {
    return (
      <>
        {/* <Navbar /> */}
        <div className="min-h-screen flex items-center justify-center" style={{backgroundColor: 'var(--color-bg-light)'}}>
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2" style={{color: 'var(--color-primary)'}}>Property Not Found</h2>
            <p className="text-gray-600 mb-4">The property you're looking for doesn't exist.</p>
            <button onClick={() => navigate('/')} className="btn-primary">
              Browse Properties
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* <Navbar /> */}
      <div className="min-h-screen" style={{backgroundColor: 'var(--color-bg-light)'}}>
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
          <button
            onClick={() => navigate(-1)}
            className="mb-4 sm:mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors font-medium text-sm sm:text-base"
          >
            ← Back to Properties
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              <div className="card p-3 sm:p-6">
                {allImages.length > 0 ? (
                  <>
                    <div className="relative mb-3 sm:mb-4 shadow-xl rounded-xl sm:rounded-2xl overflow-hidden bg-gray-100 group">
                      <div className="aspect-[16/9] w-full overflow-hidden">
                        <img
                          key={selectedImage}
                          src={allImages[selectedImage]}
                          alt={property.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/1200x675/cccccc/969696?text=Image+Not+Available';
                            e.target.onerror = null;
                          }}
                        />
                        
                        {allImages.length > 1 && (
                          <>
                            <div className="absolute inset-y-0 left-0 flex items-center pl-2 sm:pl-4 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={prevImage} className="bg-white/90 hover:bg-white p-2 sm:p-3 rounded-full shadow-lg text-teal-600 transition-transform hover:scale-110">
                                <span className="text-xl sm:text-2xl">‹</span>
                              </button>
                            </div>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:pr-4 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={nextImage} className="bg-white/90 hover:bg-white p-2 sm:p-3 rounded-full shadow-lg text-teal-600 transition-transform hover:scale-110">
                                <span className="text-xl sm:text-2xl">›</span>
                              </button>
                            </div>
                            <div className="absolute bottom-3 sm:bottom-6 right-3 sm:right-6 bg-black/60 backdrop-blur-md px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-white text-xs sm:text-sm font-medium border border-white/20">
                              {selectedImage + 1} / {allImages.length}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    
                    {allImages.length > 1 && (
                      <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 no-scrollbar">
                        {allImages.map((img, i) => (
                          <button
                            key={i}
                            onClick={() => setSelectedImage(i)}
                            className={`relative flex-shrink-0 w-20 h-14 sm:w-32 sm:h-20 overflow-hidden rounded-lg sm:rounded-xl transition-all ${
                              selectedImage === i 
                              ? 'ring-2 ring-teal-500 ring-offset-2 scale-95' 
                              : 'opacity-70 hover:opacity-100'
                            }`}
                          >
                            <img
                              src={img}
                              alt={`View ${i + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="aspect-[16/9] bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center">
                    <span className="text-3xl sm:text-5xl mb-2">🏠</span>
                    <p className="text-gray-400 font-medium text-sm sm:text-base">No images uploaded yet</p>
                  </div>
                )}
              </div>

              <div className="card p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4" style={{color: 'var(--color-primary)'}}>Description</h2>
                <div className="text-sm sm:text-base text-gray-700 whitespace-pre-line leading-relaxed">
                  {property.description || 'No description available.'}
                </div>
              </div>

              {property.amenities && property.amenities.length > 0 && (
                <div className="card p-4 sm:p-6">
                  <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4" style={{color: 'var(--color-primary)'}}>✨ Amenities</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                    {Array.isArray(property.amenities) && property.amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg" style={{backgroundColor: 'var(--color-bg-light)'}}>
                        <span className="text-lg sm:text-xl" style={{color: 'var(--color-success)'}}>✓</span>
                        <span className="text-sm sm:text-base text-gray-700 capitalize">{amenity.replace(/_/g, ' ')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
  

            <div className="space-y-4 sm:space-y-6">
              <div className="card p-4 sm:p-6">
                <h1 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3" style={{color: 'var(--color-primary)'}}>{property.title}</h1>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                  <span>📍</span>
                  <span>{property.address}, {property.city}</span>
                </div>
                
                <div className="text-right mb-3 sm:mb-4">
                  <div className="price-tag text-2xl sm:text-3xl">${property.price}</div>
                  <div className="text-xs sm:text-sm text-gray-500">per month</div>
                </div>

                <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                  {property.is_verified && (
                    <span className="badge-success text-xs">✓ Verified</span>
                  )}
                  {property.instant_booking && (
                    <span className="badge-info text-xs">⚡ Instant</span>
                  )}
                  {property.furnishing && (
                    <span className="badge-warning capitalize text-xs">{property.furnishing}</span>
                  )}
                  <span className="badge-info capitalize text-xs">{property.property_type}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg" style={{backgroundColor: 'var(--color-bg-light)'}}>
                  <div className="text-center">
                    <div className="text-lg sm:text-xl font-bold mb-1" style={{color: 'var(--color-primary)'}}>{property.bedrooms}</div>
                    <div className="text-xs text-gray-600">Bedrooms</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg sm:text-xl font-bold mb-1" style={{color: 'var(--color-primary)'}}>{property.bathrooms}</div>
                    <div className="text-xs text-gray-600">Bathrooms</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg sm:text-xl font-bold mb-1" style={{color: 'var(--color-primary)'}}>{property.area_sqft}</div>
                    <div className="text-xs text-gray-600">Sq. Ft.</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg sm:text-xl font-bold mb-1" style={{color: 'var(--color-primary)'}}>{property.view_count || 0}</div>
                    <div className="text-xs text-gray-600">Views</div>
                  </div>
                </div>
              </div>

              <div className="card p-4 sm:p-6">
                <h3 className="font-bold text-base sm:text-lg mb-3 sm:mb-4" style={{color: 'var(--color-primary)'}}>👤 Property Owner</h3>
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-white text-base sm:text-lg font-bold"
                       style={{background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))'}}>
                    {property.owner_name?.charAt(0).toUpperCase() || 'O'}
                  </div>
                  <div>
                    <div className="font-semibold text-sm sm:text-base">{property.owner_name || 'Owner'}</div>
                    {property.owner_verified && (
                      <div className="text-xs flex items-center gap-1" style={{color: 'var(--color-success)'}}>
                        <span>✓</span>
                        <span>Verified</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {isAuthenticated && user?.role === 'tenant' && (
                  <div className="bg-blue-50 border border-blue-300 rounded-lg p-2.5 sm:p-3 mb-3 sm:mb-4">
                    <div className="text-xs font-semibold text-blue-800 mb-1">📞 Contact Information</div>
                    <p className="text-xs text-blue-700">
                      Owner contact details will be available after payment verification
                    </p>
                  </div>
                )}
                
                {(!isAuthenticated || user?.role !== 'tenant') && (
                  <>
                    {property.owner_email && (
                      <div className="mb-2 sm:mb-3">
                        <div className="text-xs text-gray-500">Email</div>
                        <div className="text-xs sm:text-sm font-medium break-all">{property.owner_email}</div>
                      </div>
                    )}
                    
                    {property.owner_phone && (
                      <div className="mb-3 sm:mb-4">
                        <div className="text-xs text-gray-500">Phone</div>
                        <div className="text-xs sm:text-sm font-medium">{property.owner_phone}</div>
                      </div>
                    )}
                  </>
                )}

                <div className="space-y-2">
                  {isAuthenticated && user?.role === 'tenant' ? (
                    <>
                      <button onClick={handleBookingClick} className="btn-primary w-full text-xs sm:text-sm py-2 sm:py-2.5">
                        {property.instant_booking ? '⚡ Book Instantly' : '📅 Request Booking'}
                      </button>
                      
                      <button
                        onClick={handleWishlistToggle}
                        className={`w-full py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold border-2 transition-all ${
                          inWishlist ? 'bg-red-50 border-red-500 text-red-600' : 'border-gray-300 text-gray-700 hover:border-gray-400'
                        }`}
                      >
                        {inWishlist ? '❤️ In Wishlist' : '🤍 Add to Wishlist'}
                      </button>
                    </>
                  ) : !isAuthenticated ? (
                    <Link 
                      to="/login" 
                      state={{ 
                        from: `/properties/${id}`,
                        message: 'Please login to book this property'
                      }}
                      className="btn-primary w-full block text-center text-xs sm:text-sm py-2 sm:py-2.5"
                    >
                      Login to Book
                    </Link>
                  ) : (
                    <div className="text-center text-gray-600 py-2 text-xs sm:text-sm">
                      Only tenants can book properties
                    </div>
                  )}

                  {property.owner_phone && (!isAuthenticated || user?.role !== 'tenant') && (
                    <button onClick={handleWhatsAppContact} className="w-full bg-green-500 text-white py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold hover:bg-green-600 transition-colors">
                      <MessageOutlined/> WhatsApp
                    </button>
                  )}

                  <button onClick={handleShare} className="btn-outline w-full text-xs sm:text-sm py-2 sm:py-2.5">
                    <ShareAltOutlined/> Share
                  </button>
                </div>
              </div>

              {(property.avg_rating && property.avg_rating > 0) && (
                <div className="card p-4 sm:p-6">
                  <h3 className="font-bold text-base sm:text-lg mb-3 sm:mb-4" style={{color: 'var(--color-primary)'}}>⭐ Ratings</h3>
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold mb-2" style={{color: 'var(--color-warning)'}}>
                      {property.avg_rating.toFixed(1)}
                    </div>
                    <div className="flex justify-center mb-2">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={`text-lg sm:text-xl ${i < Math.floor(property.avg_rating) ? 'text-yellow-400' : 'text-gray-300'}`}>
                          ★
                        </span>
                      ))}
                    </div>
                    <div className="text-xs text-gray-600">
                      {property.total_reviews || 0} review(s)
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {property.latitude && property.longitude && (
            <div className="card p-4 sm:p-6 mt-6 sm:mt-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div>
                  <h2 className="text-lg sm:text-2xl font-bold mb-1" style={{color: 'var(--color-primary)'}}>
                    📍 Location & Navigation
                  </h2>
                  <div className="text-xs sm:text-sm text-gray-600">
                    {parseFloat(property.latitude).toFixed(6)}, 
                    {parseFloat(property.longitude).toFixed(6)}
                  </div>
                </div>
                
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => setMapView('simple')}
                    className={`flex-1 sm:flex-none px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-semibold text-xs sm:text-sm transition-all ${
                      mapView === 'simple'
                        ? 'bg-[var(--color-primary)] text-white shadow-md'
                        : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-[var(--color-primary)]'
                    }`}
                  >
                    📍 View Location
                  </button>
                  <button
                    onClick={() => setMapView('routing')}
                    className={`flex-1 sm:flex-none px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-semibold text-xs sm:text-sm transition-all ${
                      mapView === 'routing'
                        ? 'bg-[var(--color-primary)] text-white shadow-md'
                        : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-[var(--color-primary)]'
                    }`}
                  >
                    🧭 Get Directions
                  </button>
                </div>
              </div>

              <div className="mb-3 sm:mb-4">
                {mapView === 'simple' ? (
                  <MapView
                    latitude={property.latitude}
                    longitude={property.longitude}
                    propertyTitle={property.title}
                    address={`${property.address}, ${property.city}`}
                    height="400px"
                    showControls={true}
                  />
                ) : (
                  <RoutingMap
                    propertyLatitude={property.latitude}
                    propertyLongitude={property.longitude}
                    propertyTitle={property.title}
                    propertyAddress={`${property.address}, ${property.city}`}
                    height="500px"
                  />
                )}
              </div>

              <div className={`rounded-lg p-3 sm:p-4 border-2 ${
                mapView === 'simple' 
                  ? 'bg-blue-50 border-blue-300' 
                  : 'bg-green-50 border-green-300'
              }`}>
                {mapView === 'simple' ? (
                  <div className="text-xs sm:text-sm">
                    <div className="flex items-start gap-2 mb-2">
                      <span className="text-blue-600 font-bold">📍</span>
                      <div>
                        <strong className="text-blue-900">Viewing property location</strong>
                        <p className="text-blue-700 mt-1">
                          Click the marker for details. Use zoom controls to explore the area.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs sm:text-sm">
                    <div className="flex items-start gap-2 mb-2 sm:mb-3">
                      <span className="text-green-600 font-bold text-lg sm:text-xl">🧭</span>
                      <div>
                        <strong className="text-green-900 text-sm sm:text-base">How to get directions:</strong>
                      </div>
                    </div>
                    <ol className="list-decimal ml-5 sm:ml-6 space-y-1.5 sm:space-y-2 text-green-800">
                      <li>Click the <strong>"Get Directions"</strong> button on the map</li>
                      <li>Allow location access when your browser asks</li>
                      <li>Choose travel mode: 🚗 Drive, 🚶 Walk, or 🚴 Cycle</li>
                      <li>View route with distance & estimated time</li>
                      <li>Drag waypoints to adjust your route</li>
                    </ol>
                    <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-green-300">
                      <p className="text-green-700">
                        <strong>💡 Tip:</strong> The route will show alternative paths and 
                        real-time distance calculations.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {showBookingModal && (
        <div className="modal-overlay">
          <div className="modal-content max-w-md mx-4">
            <div className="flex justify-between items-center p-4 sm:p-6 border-b">
              <h2 className="text-xl sm:text-2xl font-bold" style={{color: 'var(--color-primary)'}}>Book This Property</h2>
              <button onClick={() => setShowBookingModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">
                ×
              </button>
            </div>
            
            <div className="p-4 sm:p-6 scrollable-form">
              <div className="p-3 sm:p-4 rounded-lg mb-3 sm:mb-4" style={{backgroundColor: 'rgba(0, 191, 165, 0.1)'}}>
                <div className="font-semibold text-base sm:text-lg mb-1">{property.title}</div>
                <div className="price-tag text-xl sm:text-2xl">${property.price}/month</div>
                <div className="text-xs sm:text-sm text-gray-600 mt-1">
                  {property.address}, {property.city}
                </div>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="form-label text-sm">Move-in Date *</label>
                  <input
                    type="date"
                    required
                    min={today}
                    className="input-ui text-sm"
                    value={bookingData.start_date}
                    onChange={(e) => setBookingData({...bookingData, start_date: e.target.value})}
                  />
                </div>

                <div>
                  <label className="form-label text-sm">Expected End Date (Optional)</label>
                  <input
                    type="date"
                    min={bookingData.start_date || today}
                    className="input-ui text-sm"
                    value={bookingData.end_date}
                    onChange={(e) => setBookingData({...bookingData, end_date: e.target.value})}
                  />
                  <p className="text-xs text-gray-500 mt-1">Leave empty for long-term rental</p>
                </div>

                <div>
                  <label className="form-label text-sm">Message to Owner (Optional)</label>
                  <textarea
                    rows="4"
                    className="input-ui resize-none text-sm"
                    placeholder="Introduce yourself and tell the owner why you're interested..."
                    value={bookingData.message}
                    onChange={(e) => setBookingData({...bookingData, message: e.target.value})}
                  />
                </div>

                <div className="flex gap-2 sm:gap-3 pt-3 sm:pt-4">
                  <button
                    type="button"
                    onClick={() => setShowBookingModal(false)}
                    className="flex-1 btn-outline text-sm py-2 sm:py-2.5"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleBooking}
                    className="flex-1 btn-primary text-sm py-2 sm:py-2.5"
                  >
                    {property.instant_booking ? 'Confirm' : 'Send Request'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PropertyDetails;