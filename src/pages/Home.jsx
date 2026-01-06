import React, { useEffect, useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import { FaLocationDot } from "react-icons/fa6";

import { useAuth } from "../context/AuthContext";

import { propertyAPI } from "../services/api";

import PropertyCard from "../pages/Properties/PropertyCard";

import FAQ from "../pages/FAQ";

const Home = () => {
  const { isAuthenticated } = useAuth();

  const navigate = useNavigate();

  const [properties, setProperties] = useState([]);

  const [featuredProperties, setFeaturedProperties] = useState([]);

  const [loading, setLoading] = useState(false);

  const [setInitialLoading] = useState(true);

  const [filters, setFilters] = useState({
    city: "",
    property_type: "",
    max_price: "",
  });

  //  state definitions

  const RECENT_LIMIT = 6; // 8 properties for home page

  const [activeSlide, setActiveSlide] = useState(0);

  const sliderImages = ["/indoor.jpg", "/indoor-design.jpg", "/view.jpg"];

  useEffect(() => {
    const loadData = async () => {
      setInitialLoading(true);

      await Promise.all([loadAllProperties(), loadFeaturedProperties()]);

      setInitialLoading(false);
    };

    loadData();

    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % sliderImages.length);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    loadAllProperties();
  }, [filters]);

  const loadAllProperties = async () => {
    setLoading(true);

    try {
      // ✅ Backend बाटै 8 properties लिने

      const res = await propertyAPI.getAll({
        ...filters,

        sort_by: "newest",

        limit: RECENT_LIMIT,

        offset: 0,
      });

      setProperties(res.data.properties || []);
    } catch (error) {
      console.error("Error loading properties:", error);

      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  const loadFeaturedProperties = async () => {
    try {
      const res = await propertyAPI.getFeatured();

      setFeaturedProperties(res.data.properties || []);
    } catch (err) {
      console.error("Error loading featured properties:", err);

      setFeaturedProperties([]);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();

    navigate("/properties", { state: { filters } });
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleCategoryClick = (type) => {
    handleFilterChange("property_type", type);

    if (window.innerWidth < 768) {
      navigate("/properties", {
        state: { filters: { ...filters, property_type: type } },
      });
    }
  };

  const handleCityClick = (city) => {
    handleFilterChange("city", city);

    if (window.innerWidth < 768) {
      navigate("/properties", { state: { filters: { ...filters, city } } });
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-[#1A2B3C] antialiased">
      {/* 1. PREMIUM HERO SECTION */}

      <section className="relative h-[430px] flex items-center justify-center overflow-hidden">
        {sliderImages.map((img, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-[1500ms] ease-in-out ${
              idx === activeSlide
                ? "opacity-100 scale-100"
                : "opacity-0 scale-110"
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/60 z-10" />

            <img
              src={img}
              alt="Premium Living"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        ))}

        <div className="relative z-20 max-w-6xl mx-auto text-center px-4 sm:px-6 gap-6">
          <span className="inline-block bg-[#00BFA5]/20 backdrop-blur-md text-[#00BFA5] px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest  animate-fade-in">
            ✨ Your Premium Rental Partner
          </span>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white mb-20 sm:mb-30 tracking-tight leading-tight">
            Elevate Your <span className="text-[#00BFA5]">Living</span>{" "}
            Experience
          </h1>

 <div className="backdrop-blur-xl bg-white/10 p-2 rounded-3xl max-w-5xl mx-auto transform hover:scale-[1.02] transition-all duration-500 shadow-2xl border border-white/20">
  <form 
    onSubmit={handleSearch} 
    className="bg-gradient-to-r from-[#e0f7fa] to-[#b2ebf2] rounded-3xl flex flex-col md:flex-row items-center p-2 gap-2 md:gap-4"
  >
    {/* Location Input */}
    <div className="flex-[1.5] flex items-center px-5 py-3 w-full md:border-r border-gray-300/30 rounded-xl bg-white/20 backdrop-blur-sm">
      <span className="text-2xl mr-3 text-[#055583]"><FaLocationDot /></span>
      <input
        type="text"
        placeholder="Where to live?"
        className="w-full outline-none text-gray-900 bg-transparent font-semibold placeholder:text-gray-800 text-base"
        value={filters.city}
        onChange={(e) => handleFilterChange('city', e.target.value)}
      />
    </div>

    {/* Property Type Dropdown */}
    <div className="flex-1 w-full md:w-auto px-4">
      <div className="relative">
        <select
          className="w-full appearance-none bg-white/30 border border-gray-300/40 
                     rounded-xl px-4 py-3 pr-10 text-sm font-medium text-gray-800 
                     shadow-sm cursor-pointer backdrop-blur-sm
                     focus:outline-none focus:ring-2 focus:ring-[#055583] focus:border-[#055583]
                     hover:border-gray-400 transition"
          value={filters.property_type}
          onChange={(e) => handleFilterChange('property_type', e.target.value)}
        >
          <option value="">All Property Types</option>
          <option value="room">Room</option>
          <option value="flat">Flat</option>
          <option value="house">House</option>
        </select>

        {/* Custom Arrow */}
        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </div>
    </div>

    {/* Search Button */}
    <button 
      type="submit" 
      className="w-full md:w-auto bg-[#055583] hover:bg-[#033f5e] text-white px-8 py-3 rounded-full font-extrabold transition-all duration-300 shadow-lg flex items-center justify-center gap-2 text-base group"
    >
      SEARCH
      <span className="group-hover:translate-x-2 transition-transform duration-300">→</span>
    </button>
  </form>
</div>



          <div className="mt-6 sm:mt-8 flex flex-wrap justify-center gap-2 sm:gap-4 text-white/80 text-xs sm:text-sm font-medium">
            <span className="opacity-60 uppercase tracking-widest text-[10px] flex items-center">
              Trending Cities:
            </span>

            {["Kathmandu", "Pokhara", "Lalitpur", "Butwal"].map((city) => (
              <button
                key={city}
                onClick={() => handleCityClick(city)}
                className="px-2 sm:px-3 py-1 bg-white/10 hover:bg-[#00BFA5] rounded-full backdrop-blur-sm transition-colors text-xs sm:text-sm"
              >
                {city}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 2. STATS & TRUST BAR */}

      <section className="relative -mt-8 sm:-mt-12 z-30 max-w-6xl mx-auto px-3 sm:px-4">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-[0_12px_30px_rgba(0,0,0,0.05)] border border-gray-100 p-4 sm:p-6 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
          {[
            { n: "3,000+", l: "Listings" },

            { n: "10k+", l: "Happy Users" },

            { n: "100%", l: "Verified" },

            { n: "0%", l: "Commission" },
          ].map((stat, i) => (
            <div key={i} className="text-center group">
              <p className="text-lg sm:text-xl md:text-2xl font-extrabold text-[#1A2B3C] group-hover:text-[#00BFA5] transition-colors">
                {stat.n}
              </p>

              <p className="text-gray-400 text-[9px] font-bold uppercase tracking-[0.18em] mt-0.5">
                {stat.l}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. CATEGORIES */}

      <section className="py-4 sm:py-6 md:py-8 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 sm:mb-12 md:mb-16 gap-4 sm:gap-6">

         <div className="max-w-xl mx-auto text-center">
  <h2 className="text-2xl sm:text-3xl md:text-4xl font-black mb-2 sm:mb-4">
    Explore by <span className="text-[#00BFA5]">Category</span>
  </h2>

  <p className="text-gray-500 text-sm sm:text-base">
    Tailored spaces for your unique lifestyle. From cozy rooms to spacious flats.
  </p>
</div>

         

        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
          {[
            { label: "Single Room", icon: "🏠", type: "room" },

            { label: "Luxury Flat", icon: "🏢", type: "flat" },

            { label: "House", icon: "🏡", type: "house" },

            { label: "Office", icon: "💼", type: "office" },

            { label: "Roommate", icon: "🤝", type: "roommate" },
          ].map((cat) => (
            <button
              key={cat.label}
              onClick={() => handleCategoryClick(cat.type)}
              className="group bg-white p-2 sm:p-4 md:p-4 rounded-2xl sm:rounded-3xl border border-gray-100 hover:border-[#00BFA5]/30 hover:shadow-[0_20px_40px_rgba(0,191,165,0.1)] transition-all duration-500 text-center"
            >
              <div className="text-3xl sm:text-4xl md:text-5xl mb-3 sm:mb-2 md:mb-4 transform group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-500">
                {cat.icon}
              </div>

              <p className="font-bold text-[#1A2B3C] group-hover:text-[#00BFA5] transition-colors text-xs sm:text-sm md:text-base">
                {cat.label}
              </p>
            </button>
          ))}
        </div>
      </section>

      {/* 4. PREMIUM LISTINGS */}

      {featuredProperties.length > 0 && (
        <section className="bg-white py-4 sm:py-4 md:py-6 px-4 sm:px-6 border-y border-gray-100">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-4 mb-8 sm:mb-12">
              <div className="h-px bg-gray-200 flex-grow"></div>

              <h2 className="text-lg sm:text-xl md:text-2xl font-black text-[#1A2B3C] uppercase tracking-tighter whitespace-nowrap">
                ⭐ Premium Selection
              </h2>

              <div className="h-px bg-gray-200 flex-grow"></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 md:gap-10">
              {featuredProperties.slice(0, 3).map((p) => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 5. NEW ARRIVALS */}

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-4 md:py-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 sm:mb-12 gap-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#1A2B3C]">
            Recently Added
          </h2>

          <Link
            to="/allproperties"
            className="group text-[#1A2B3C] font-bold flex items-center gap-2 hover:text-[#00BFA5]  transition-colors text-sm sm:text-base"
          >
            Explore All Listings{" "}
            <span className="group-hover:translate-x-2 transition-transform">
              →
            </span>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 md:gap-10">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-64 sm:h-80 md:h-96 bg-gray-100 rounded-2xl sm:rounded-3xl animate-pulse"
              />
            ))}
          </div>
        ) : properties.length > 0 ? (
          // ✅ NO .slice() - 8 data comes from backend
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 md:gap-10">
            {properties.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 sm:py-16">
            <div className="text-4xl mb-4">🏠</div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-600 mb-2">No properties found</h3>
            <p className="text-gray-500">Try adjusting your filters or check back later for new listings.</p>
          </div>
        )}
      </section>

      {/* 6. WHO IS THIS FOR */}

      <section className="py-16 px-4 sm:px-6 lg:px-20 bg-[#F7FAFC]">
        <div className="max-w-7xl mx-auto text-center">
          
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-12 text-gray-900">
            Who is this for?
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 justify-items-center">

            {/* Card 1 */}
            <div className="bg-white px-8 py-6 rounded-3xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 w-full max-w-[360px] flex flex-col items-center text-center">
              <div className="text-5xl mb-3">🎓</div>
              <p className="text-2xl font-bold mb-2">Students</p>
              <p className="text-gray-500 text-sm sm:text-base">
                Properties near colleges with budget-friendly options.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white px-8 py-6 rounded-3xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 w-full max-w-[360px] flex flex-col items-center text-center">
              <div className="text-5xl mb-3">👨‍💼</div>
              <p className="text-2xl font-bold mb-2">Professionals</p>
              <p className="text-gray-500 text-sm sm:text-base">
                Quiet neighborhoods with parking and convenient amenities.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white px-8 py-6 rounded-3xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 w-full max-w-[360px] flex flex-col items-center text-center">
              <div className="text-5xl mb-3">👨‍👩‍👧</div>
              <p className="text-2xl font-bold mb-2">Families</p>
              <p className="text-gray-500 text-sm sm:text-base">
                Safe, spacious homes ideal for families.
              </p>
            </div>

            {/* Card 4 */}
            <div className="bg-white px-8 py-6 rounded-3xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 w-full max-w-[360px] flex flex-col items-center text-center">
              <div className="text-5xl mb-3">🧳</div>
              <p className="text-2xl font-bold mb-2">New in City</p>
              <p className="text-gray-500 text-sm sm:text-base">
                Trusted and verified listings for a smooth start.
              </p>
            </div>

          </div>
        </div>
      </section>


 


<section className="py-14 md:py-16 bg-gradient-to-b from-white via-gray-50 to-white border-b border-gray-200 px-4 sm:px-4">
  <div className="max-w-7xl mx-auto text-center">
    <h2 className="text-3xl md:text-4xl font-extrabold text-[#1A2B3C] mb-8">
      Simple. Fast. Reliable.
    </h2>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
      {[
        { t: 'Smart Discovery', d: 'Advanced filters to find exactly what you need.', i: '01', icon: '🔍' },
        { t: 'Verified Tours', d: 'Connect directly with owners for real visits.', i: '02', icon: '🏠' },
        { t: 'Secure Move-in', d: 'Paperwork and keys made simple.', i: '03', icon: '🔑' }
      ].map(step => (
        <div
          key={step.i}
          className="relative p-8 bg-white rounded-3xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border border-gray-100 flex flex-col items-center text-center"
        >
          {/* Big background number */}
         <span className="absolute ml-10 -top-1 -left-1 text-5xl md:text-7xl font-extrabold text-[#1A2B3C]/10 select-none pointer-events-none">
  {step.i}
</span>


          {/* Icon inside the card */}
          <div className="text-5xl mb-4">
            {step.icon}
          </div>

          {/* Step Title */}
          <h3 className="text-xl md:text-2xl font-bold text-[#1A2B3C] mb-3">
            {step.t}
          </h3>

          {/* Step Description */}
          <p className="text-gray-600 leading-relaxed">
            {step.d}
          </p>
        </div>
      ))}
    </div>
  </div>
</section>

   <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-4 md:pb-4">

    <FAQ/>

</section>





<section className="py-8 md:py-8 bg-[#F8FAFC] px-4 sm:px-6 ">

  <div className="max-w-7xl mx-auto">

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

      {[1, 2, 3].map(i => (

        <div

          key={i}

          className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all"

        >

          <div className="text-[#00BFA5] mb-6 text-lg">★★★★★</div>



          <p className="text-gray-600 leading-relaxed italic mb-8">

            “The transparency of this platform is unmatched. I found my flat in just 2 days without paying a single rupee to brokers.”

          </p>



          <div className="flex items-center gap-4">

            <div className="w-12 h-12 rounded-full bg-gray-100" />
            <div>
              <p className="font-bold text-gray-900">Happy User</p>
              <p className="text-sm text-gray-500">Verified Tenant</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>

<section className="relative max-w-6xl mt-10 mx-auto px-4 sm:px-6 pb-16 md:pb-16">

  {/* Soft Outer Glow */}
  <div className="absolute inset-0 -z-10 flex justify-center">
    <div className="w-[75%] h-[75%] bg-[#00BFA5]/8 blur-[140px] rounded-full" />
  </div>

  {/* Main Card */}
  <div className="relative rounded-[32px] overflow-hidden
                  bg-gradient-to-br from-[#1b2b3c] via-[#1f3448] to-[#243f5c]
                  shadow-[0_30px_90px_-30px_rgba(0,191,165,0.3)]
                  border border-white/10">

    {/* Subtle Gradient Border */}
    <div className="absolute inset-0 rounded-[32px] p-[1px]
                    bg-gradient-to-r from-[#00BFA5]/30 via-transparent to-[#00BFA5]/30" />

    {/* Inner Content */}
    <div className="relative z-10 px-6 sm:px-10 lg:px-16
                    py-12 sm:py-14 text-center
                    backdrop-blur-lg bg-white/5">

      {/* Badge */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5
                      rounded-full bg-[#00BFA5]/10 border border-[#00BFA5]/25
                      text-[#00BFA5] text-xs font-semibold mb-6">
        🚀 Free • No Brokers • Verified
      </div>

      {/* Heading */}
      <h2 className="text-3xl sm:text-4xl lg:text-5xl
                     font-extrabold text-white leading-tight tracking-tight mb-5">
        List Your Property
        <br />
        <span className="bg-gradient-to-r from-[#00BFA5] to-[#4de7d3]
                         bg-clip-text text-transparent">
          For Free
        </span>
      </h2>

      {/* Description */}
      <p className="text-white/70 text-sm sm:text-base
                    max-w-xl mx-auto mb-10 leading-relaxed">
        Publish listings in minutes and connect directly with verified tenants —
        simple, transparent, and commission-free.
      </p>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <Link
          to={isAuthenticated ? "/post-ad" : "/login"}
          state={!isAuthenticated ? { from: "/post-ad" } : null}
          className="inline-flex items-center justify-center
                     px-10 py-3 rounded-2xl
                     font-bold text-base text-[#1A2B3C]
                     bg-gradient-to-r from-[#00BFA5] to-[#4de7d3]
                     shadow-md shadow-[#00BFA5]/30
                     transition hover:scale-105"
        >
          Start Listing
        </Link>

        <Link
          to="/how-it-works"
          className="inline-flex items-center justify-center
                     px-10 py-3 rounded-2xl
                     font-semibold text-base text-white
                     bg-white/10 border border-white/20
                     transition hover:bg-white/20"
        >
          Learn More
        </Link>
      </div>
    </div>

    {/* Minimal Ambient Glows */}
    <div className="absolute -top-32 -right-32 w-[380px] h-[380px]
                    bg-[#00BFA5]/12 rounded-full blur-[140px]" />
    <div className="absolute -bottom-32 -left-32 w-[320px] h-[320px]
                    bg-[#00BFA5]/8 rounded-full blur-[120px]" />

  </div>
</section>



      
    </div>
  );
};

export default Home;
