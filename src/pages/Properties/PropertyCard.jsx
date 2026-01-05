import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { wishlistAPI } from "../../services/api";
import { HeartOutlined, HeartFilled } from "@ant-design/icons";

const PropertyCard = ({ property, onWishlistChange, onCardClick }) => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [inWishlist, setInWishlist] = useState(property.inWishlist || false);
  const [loading, setLoading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const imageContainerRef = useRef(null);

  const amenities = property.amenities || [];

  const getAmenityIcon = (amenity) => {
    const icons = {
      wifi: "📶",
      parking: "🅿️",
      water: "💧",
      kitchen: "🍳",
      ac: "❄️",
      laundry: "🧺",
      security: "🔒",
      pool: "🏊",
      gym: "💪",
      elevator: "🛗",
      tv: "📺",
      heating: "🔥",
      balcony: "🌆",
      garden: "🌳",
      pet_friendly: "🐾",
    };
    return icons[amenity] || "🏠";
  };

  const parseImages = () => {
    let images = [];
    try {
      if (typeof property.images === "string") {
        const parsed = JSON.parse(property.images);
        if (Array.isArray(parsed)) {
          images = parsed.filter((img) => img && img.trim() !== "");
        }
      } else if (Array.isArray(property.images)) {
        images = property.images.filter((img) => img && img.trim() !== "");
      }
      if (property.primary_image && property.primary_image.trim() !== "") {
        if (!images.includes(property.primary_image)) {
          images = [property.primary_image, ...images];
        }
      }
      images = [...new Set(images)];
    } catch (err) {
      console.error("Error parsing images:", err);
    }
    return images.length === 0 ? ["/api/placeholder/400/300"] : images;
  };

  const images = parseImages();

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [images.length]);

  const nextImage = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user || user.role !== "tenant") {
      navigate("/login", {
        state: {
          from: `/properties/${property.id}`,
          message: "Please login as a tenant to add to wishlist",
        },
      });
      return;
    }

    setLoading(true);
    try {
      const response = await wishlistAPI.toggle(property.id);
      setInWishlist(response.data.inWishlist);
      if (onWishlistChange)
        onWishlistChange(property.id, response.data.inWishlist);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update wishlist");
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/properties/${property.id}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: property.title, url: shareUrl });
      } catch (err) {}
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert("Link copied!");
    }
  };

  const handleWhatsAppShare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/properties/${property.id}`;
    window.open(
      `https://wa.me/?text=${encodeURIComponent(
        property.title + " " + shareUrl
      )}`,
      "_blank"
    );
  };

  const handleMapView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    window.location.href = `/properties/${property.id}/map`;
  };

  const handleCardClick = (e) => {
    if (e.target.closest("button")) {
      return;
    }

    const propertyUrl = `/properties/${property.id}`;

    if (!isAuthenticated) {
      navigate("/login", {
        state: {
          from: propertyUrl,
          message: "Please login to view property details",
        },
      });
    } else {
      if (typeof onCardClick === "function") {
        onCardClick(property);
      } else {
        navigate(propertyUrl);
      }
    }
  };

  const handleViewDetails = () => {
    const propertyUrl = `/properties/${property.id}`;

    if (!isAuthenticated) {
      navigate("/login", {
        state: {
          from: propertyUrl,
          message: "Please login to view property details",
        },
      });
    } else {
      if (typeof onCardClick === "function") {
        onCardClick(property);
      } else {
        navigate(propertyUrl);
      }
    }
  };

  return (
    // <div
    //     onClick={handleCardClick}
    //     className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200 cursor-pointer h-full"
    // >
    //     {/* Image Section */}
    //     <div className="relative h-44 overflow-hidden" ref={imageContainerRef}>
    //         <div className="relative h-full w-full">
    //             {images.map((img, idx) => (
    //                 <div
    //                     key={idx}
    //                     className={`absolute inset-0 transition-opacity duration-500 ${idx === currentImageIndex ? 'opacity-100' : 'opacity-0'}`}
    //                 >
    //                     <img
    //                         src={img}
    //                         alt={property.title}
    //                         className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
    //                     />
    //                 </div>
    //             ))}
    //         </div>

    //         {/* Arrows */}
    //         {images.length > 1 && (
    //             <>
    //                 <button
    //                     onClick={prevImage}
    //                     className="absolute left-1.5 top-1/2 -translate-y-1/2 bg-black/40 text-white w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
    //                 >
    //                     ←
    //                 </button>
    //                 <button
    //                     onClick={nextImage}
    //                     className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-black/40 text-white w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
    //                 >
    //                     →
    //                 </button>
    //             </>
    //         )}

    //         {/* Badges */}
    //         <div className="absolute top-2 left-2 flex flex-col gap-1">
    //             <span className="bg-[#00BFA5] text-white text-[8px] font-semibold px-2 py-0.5 rounded uppercase tracking-wide">
    //                 New Listing
    //             </span>
    //             {property.featured && (
    //                 <span className="bg-yellow-500 text-white text-[8px] font-semibold px-2 py-0.5 rounded uppercase tracking-wide">
    //                     ⭐ Featured
    //                 </span>
    //             )}
    //             {property.is_verified && (
    //                 <span className="bg-blue-500 text-white text-[8px] font-semibold px-2 py-0.5 rounded uppercase tracking-wide">
    //                     ✅ Verified
    //                 </span>
    //             )}
    //         </div>

    //         {/* Wishlist */}
    //         <button
    //             onClick={handleWishlistToggle}
    //             disabled={loading}
    //             className="absolute top-2 right-2 transition-transform hover:scale-110"
    //         >
    //             {loading ? (
    //                 <span className="text-white text-xs">...</span>
    //             ) : inWishlist ? (
    //                 <HeartFilled style={{ color: '#ff4d4f', fontSize: '18px' }} />
    //             ) : (
    //                 <HeartOutlined style={{ color: 'white', fontSize: '18px' }} />
    //             )}
    //         </button>

    //         {/* Dots */}
    //         {images.length > 1 && (
    //             <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
    //                 {images.map((_, idx) => (
    //                     <div
    //                         key={idx}
    //                         className={`h-1 rounded-full transition-all ${
    //                             idx === currentImageIndex ? 'w-3 bg-[#00BFA5]' : 'w-1 bg-white/70'
    //                         }`}
    //                     />
    //                 ))}
    //             </div>
    //         )}
    //     </div>

    //     {/* Content Section */}
    //     <div className="p-3">
    //         <div className="flex justify-between items-start mb-2">
    //             <div className="flex-1 min-w-0">
    //                 <h3 className="font-semibold text-sm text-gray-800 truncate">
    //                     {property.title}
    //                 </h3>
    //                 <p className="text-[10px] text-gray-500 truncate">
    //                     📍 {property.address}, {property.city}
    //                 </p>
    //             </div>
    //             <div className="text-right ml-2 flex-shrink-0">
    //                 <span className="font-bold text-base text-[#00BFA5] block leading-tight">
    //                     Rs. {property.price.toLocaleString()}
    //                 </span>
    //                 <p className="text-[8px] text-gray-400 uppercase font-medium">
    //                     per month
    //                 </p>
    //             </div>
    //         </div>

    //         {/* Property Features */}
    //         <div className="flex items-center gap-3 text-[10px] font-medium text-gray-600 my-2.5 py-1.5 border-y border-gray-100">
    //             <span>🛏️ {property.bedrooms}</span>
    //             <span>🚿 {property.bathrooms}</span>
    //             <span>📐 {property.area_sqft}</span>
    //         </div>

    //         {/* Amenities Icons */}
    //         <div className="flex flex-wrap gap-1.5 mb-3">
    //             {amenities.slice(0, 4).map((a, i) => (
    //                 <span
    //                     key={i}
    //                     className="bg-gray-50 text-gray-600 text-[8px] px-1.5 py-0.5 rounded border border-gray-200"
    //                     title={a}
    //                 >
    //                     {getAmenityIcon(a)}
    //                 </span>
    //             ))}
    //         </div>

    //         {/* Action Buttons */}
    //         <div className="flex gap-2">
    //             <button
    //                 onClick={handleViewDetails}
    //                 className="flex-1 bg-[#00BFA5] text-white text-center py-1.5 rounded hover:brightness-110 transition-all font-semibold text-[10px]"
    //             >
    //                 View Details
    //             </button>
    //             <button
    //                 onClick={handleMapView}
    //                 className="w-7 h-7 flex items-center justify-center bg-blue-50 text-blue-600 rounded hover:bg-blue-100 border border-blue-200 text-xs"
    //                 title="View on Map"
    //             >
    //                 📍
    //             </button>
    //             <button
    //                 onClick={handleShare}
    //                 className="w-7 h-7 flex items-center justify-center bg-gray-50 text-gray-500 rounded hover:bg-gray-100 border border-gray-200 text-xs"
    //                 title="Share"
    //             >
    //                 🔗
    //             </button>
    //             <button
    //                 onClick={handleWhatsAppShare}
    //                 className="w-7 h-7 flex items-center justify-center bg-green-50 text-green-600 rounded hover:bg-green-100 border border-green-200 text-xs"
    //                 title="WhatsApp"
    //             >
    //                 💬
    //             </button>
    //         </div>
    //     </div>
    // </div>
    <div className="relative max-w-full">
      {/* RESPONSIVE WIDTH — matches course card */}
      <div className="w-full min-w-[300px] max-w-[380px]">
        <div
          onClick={handleCardClick}
          className="relative bg-white rounded-[20px] border border-gray-200 overflow-hidden
                 transition duration-150 ease-in hover:-translate-y-2 hover:shadow-xl cursor-pointer"
        >
          {/* Image Section */}
          <div className="relative h-[180px] overflow-hidden group">
            {images.map((img, idx) => (
              <div
                key={idx}
                className={`absolute inset-0 transition-opacity duration-500 ${
                  idx === currentImageIndex ? "opacity-100" : "opacity-0"
                }`}
              >
                <img
                  src={img}
                  alt={property.title}
                  className="h-full w-full object-fill group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            ))}
          </div>

          {/* Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-1">
            <span className="bg-black text-white text-xs px-2 py-1 rounded-md">
              New Listing
            </span>
            {property.is_verified && (
              <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-md">
                ✅ Verified
              </span>
            )}
          </div>

          {/* Wishlist */}
          <button
            onClick={handleWishlistToggle}
            className="absolute top-4 right-4"
          >
            {inWishlist ? (
              <HeartFilled style={{ color: "#ff4d4f", fontSize: 20 }} />
            ) : (
              <HeartOutlined style={{ color: "white", fontSize: 20 }} />
            )}
          </button>

          {/* Content Section */}
          <div className="space-y-4 px-4 py-2 font-jost">
            <div className="space-y-1 max-h-10">
              <h3 className="font-semibold text-[18px] text-gray-900 line-clamp-2">
                {property.title}
              </h3>
              <p className="text-sm text-gray-500">
                📍 {property.address}, {property.city}
              </p>
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm  text-gray-600 max-h-8">
              <span>🛏️ {property.bedrooms} Beds</span>
              <span>🚿 {property.bathrooms} Bath</span>
              <span className="w-32">📐 {property.area_sqft} sqft</span>
            </div>

            <hr className="  border-gray-200" />

            <div className="flex items-start justify-between ">
              <div>
                <p className="text-gray-400 text-xs">Per Month</p>
                <p className="text-[#00BFA5] font-medium text-base">
                  Rs. {property.price.toLocaleString()}
                </p>
              </div>

              <button
                onClick={handleViewDetails}
                className="bg-[#00BFA5] text-white px-5 py-1 rounded-lg
                       hover:brightness-110 transition font-medium"
              >
                View Details
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
