import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Layout/Navbar";
import PropertyCard from "./Properties/PropertyCard";
import { propertyAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";

const AllPropertiesPage = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // State
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12; // 3 rows × 4 columns on desktop

  // Filters (same as home page)
  const [filters, setFilters] = useState({
    city: "",
    property_type: "",
    min_price: "",
    max_price: "",
    bedrooms: "",
    bathrooms: "",
    furnishing: "",
    instant_booking: "",
    sort_by: "newest",
  });

  // Location state  filters comes Home
  useEffect(() => {
    if (location.state?.filters) {
      setFilters((prev) => ({ ...prev, ...location.state.filters }));
    }
  }, [location.state]);

  // Properties load गर्ने function
  const loadProperties = async () => {
    setLoading(true);
    try {
      const params = {
        ...filters,
        limit: itemsPerPage,
        offset: (currentPage - 1) * itemsPerPage,
      };

      // Boolean conversion
      if (params.instant_booking === "true") params.instant_booking = true;
      if (params.instant_booking === "false") params.instant_booking = false;

      const res = await propertyAPI.getAll(params);
      setProperties(res.data.properties || []);
      setTotal(res.data.total || 0);
    } catch (error) {
      console.error("Error loading properties:", error);
      setProperties([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  // Initial load & filters when changed
  useEffect(() => {
    loadProperties();
    // URL update  (optional)
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) queryParams.set(key, value);
    });
    navigate(`?${queryParams.toString()}`, { replace: true });
  }, [filters, currentPage]);

  // Filter handle
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Filter changed back  page 1
  };

  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      city: "",
      property_type: "",
      min_price: "",
      max_price: "",
      bedrooms: "",
      bathrooms: "",
      furnishing: "",
      instant_booking: "",
      sort_by: "newest",
    });
    setCurrentPage(1);
  };

  // Search submit
  const handleSearch = (e) => {
    e.preventDefault();
    loadProperties();
  };

  // Pagination
  const totalPages = Math.ceil(total / itemsPerPage);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto  sm:px-6 py-8">
        {/* Page Header */}
        {/* <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black text-[#1A2B3C] mb-2">
            All Properties
          </h1>
          <p className="text-gray-500">
            {total} properties found • Page {currentPage} of {totalPages || 1}
          </p>
        </div> */}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="lg:w-[260px]">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-24">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-bold text-lg">Filters</h2>
                <button
                  onClick={handleResetFilters}
                  className="text-sm text-[#00BFA5] hover:text-[#1A2B3C] font-medium"
                >
                  Reset All
                </button>
              </div>

              {/* Search Form */}
              <form onSubmit={handleSearch} className="space-y-6">
                {/* City */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    placeholder="City, area, or landmark"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#00BFA5] focus:ring-2 focus:ring-[#00BFA5]/20 outline-none"
                    value={filters.city}
                    onChange={(e) => handleFilterChange("city", e.target.value)}
                  />
                </div>

                {/* Property Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Property Type
                  </label>
                  <select
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#00BFA5] focus:ring-2 focus:ring-[#00BFA5]/20 outline-none"
                    value={filters.property_type}
                    onChange={(e) =>
                      handleFilterChange("property_type", e.target.value)
                    }
                  >
                    <option value="">All Types</option>
                    <option value="room">Single Room</option>
                    <option value="flat">Full Flat</option>
                    <option value="house">House</option>
                    <option value="office">Office</option>
                    <option value="roommate">Roommate</option>
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price Range (रु)
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="number"
                      placeholder="Min"
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#00BFA5] focus:ring-2 focus:ring-[#00BFA5]/20 outline-none"
                      value={filters.min_price}
                      onChange={(e) =>
                        handleFilterChange("min_price", e.target.value)
                      }
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#00BFA5] focus:ring-2 focus:ring-[#00BFA5]/20 outline-none"
                      value={filters.max_price}
                      onChange={(e) =>
                        handleFilterChange("max_price", e.target.value)
                      }
                    />
                  </div>
                </div>

                {/* Bedrooms & Bathrooms */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bedrooms
                    </label>
                    <select
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#00BFA5] focus:ring-2 focus:ring-[#00BFA5]/20 outline-none"
                      value={filters.bedrooms}
                      onChange={(e) =>
                        handleFilterChange("bedrooms", e.target.value)
                      }
                    >
                      <option value="">Any</option>
                      <option value="1">1+</option>
                      <option value="2">2+</option>
                      <option value="3">3+</option>
                      <option value="4">4+</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bathrooms
                    </label>
                    <select
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#00BFA5] focus:ring-2 focus:ring-[#00BFA5]/20 outline-none"
                      value={filters.bathrooms}
                      onChange={(e) =>
                        handleFilterChange("bathrooms", e.target.value)
                      }
                    >
                      <option value="">Any</option>
                      <option value="1">1+</option>
                      <option value="2">2+</option>
                      <option value="3">3+</option>
                    </select>
                  </div>
                </div>

                {/* Furnishing */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Furnishing
                  </label>
                  <select
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#00BFA5] focus:ring-2 focus:ring-[#00BFA5]/20 outline-none"
                    value={filters.furnishing}
                    onChange={(e) =>
                      handleFilterChange("furnishing", e.target.value)
                    }
                  >
                    <option value="">Any</option>
                    <option value="furnished">Furnished</option>
                    <option value="semi-furnished">Semi-Furnished</option>
                    <option value="unfurnished">Unfurnished</option>
                  </select>
                </div>

                {/* Instant Booking */}
                <div>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      className="w-5 h-5 rounded border-gray-300 text-[#00BFA5] focus:ring-[#00BFA5]"
                      checked={filters.instant_booking === "true"}
                      onChange={(e) =>
                        handleFilterChange(
                          "instant_booking",
                          e.target.checked ? "true" : ""
                        )
                      }
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Instant Booking Available
                    </span>
                  </label>
                </div>

                {/* Sort By */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sort By
                  </label>
                  <select
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#00BFA5] focus:ring-2 focus:ring-[#00BFA5]/20 outline-none"
                    value={filters.sort_by}
                    onChange={(e) =>
                      handleFilterChange("sort_by", e.target.value)
                    }
                  >
                    <option value="newest">Newest First</option>
                    <option value="price_low">Price: Low to High</option>
                    <option value="price_high">Price: High to Low</option>
                    <option value="most_viewed">Most Viewed</option>
                  </select>
                </div>

                {/* Apply Button */}
                <button
                  type="submit"
                  className="w-full bg-[#1A2B3C] text-white py-3 rounded-xl font-bold hover:bg-[#00BFA5] transition-colors"
                >
                  Apply Filters
                </button>
              </form>
            </div>
          </div>

          {/* Properties Grid */}
          <div className="lg:w-3/4">
            {/* Loading State */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="h-80 bg-gray-100 rounded-2xl animate-pulse"
                  />
                ))}
              </div>
            ) : properties.length > 0 ? (
              <>
                {/* Properties Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-10 auto-rows-max">
                  {properties.map((property) => (
                    <PropertyCard key={property.id} property={property} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-12">
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                      className="px-4 py-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      ← Previous
                    </button>

                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-10 h-10 rounded-lg font-medium ${
                            currentPage === pageNum
                              ? "bg-[#00BFA5] text-white"
                              : "bg-gray-100 hover:bg-gray-200"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Next →
                    </button>
                  </div>
                )}
              </>
            ) : (
              /* Empty State */
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                <div className="text-6xl mb-4">🏠</div>
                <h3 className="text-xl font-bold text-gray-600 mb-2">
                  No properties found
                </h3>
                <p className="text-gray-500 mb-6">
                  Try adjusting your filters or search for something else
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-6 py-3 bg-[#00BFA5] text-white rounded-xl font-bold hover:bg-[#1A2B3C] transition-colors"
                >
                  Reset All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#1A2B3C] text-white py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-white/60">
            © 2025 RoomRental. All property listings are verified.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default AllPropertiesPage;
