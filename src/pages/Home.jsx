import React, { useEffect, useState } from 'react';

import { Link, useNavigate } from 'react-router-dom';



import PropertyCard from './Properties/PropertyCard';

import { propertyAPI } from '../services/api';

import { useAuth } from '../context/AuthContext';

import FAQ from '../pages/FAQ';



const Home = () => {

  const { isAuthenticated } = useAuth();

  const navigate = useNavigate();

  const [properties, setProperties] = useState([]);

  const [featuredProperties, setFeaturedProperties] = useState([]);

  const [loading, setLoading] = useState(false);

  const [ setInitialLoading] = useState(true);

  const [filters, setFilters] = useState({ city: '', property_type: '', max_price: '' });

//  state definitions

const RECENT_LIMIT = 8; // 8 properties for home page

  const [activeSlide, setActiveSlide] = useState(0);

  const sliderImages = [

    "/indoor.jpg",

    "/indoor-design.jpg",

    "/view.jpg",



   ];



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

      sort_by: 'newest',

      limit: RECENT_LIMIT,

      offset: 0

    });

   

    setProperties(res.data.properties || []);

  } catch (error) {

    console.error('Error loading properties:', error);

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

      console.error('Error loading featured properties:', err);

      setFeaturedProperties([]);

    }

  };



  const handleSearch = (e) => {

    e.preventDefault();

    navigate('/properties', { state: { filters } });

  };



  const handleFilterChange = (key, value) => {

    setFilters(prev => ({ ...prev, [key]: value }));

  };



  const handleCategoryClick = (type) => {

    handleFilterChange('property_type', type);

    if (window.innerWidth < 768) {

      navigate('/properties', { state: { filters: { ...filters, property_type: type } } });

    }

  };



  const handleCityClick = (city) => {

    handleFilterChange('city', city);

    if (window.innerWidth < 768) {

      navigate('/properties', { state: { filters: { ...filters, city } } });

    }

  };



 

  return (

    <div className="min-h-screen bg-[#F8FAFC] font-sans text-[#1A2B3C] antialiased">

      



      {/* 1. PREMIUM HERO SECTION */}

      <section className="relative h-[430px] flex items-center justify-center overflow-hidden">

        {sliderImages.map((img, idx) => (

          <div key={idx} className={`absolute inset-0 transition-opacity duration-[1500ms] ease-in-out ${idx === activeSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-110'}`}>

            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/60 z-10" />

            <img src={img} alt="Premium Living" className="w-full h-full object-cover" loading="lazy" />

          </div>

        ))}



        <div className="relative z-20 max-w-6xl mx-auto text-center px-4 sm:px-6 gap-6">

          <span className="inline-block bg-[#00BFA5]/20 backdrop-blur-md text-[#00BFA5] px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest  animate-fade-in">

            ✨ Your Premium Rental Partner

          </span>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white mb-20 sm:mb-30 tracking-tight leading-tight">

            Elevate Your <span className="text-[#00BFA5]">Living</span> Experience

          </h1>

         
<div className="backdrop-blur-md bg-white/5 p-1 rounded-2xl max-w-4xl mx-auto transform hover:scale-[1.01] transition-all duration-500 shadow-xl border border-white/20">
  
  <form 
    onSubmit={handleSearch} 
    className="bg-[#9cfcefe8] rounded-2xl flex flex-col md:flex-row items-center p-1 gap-1"
  >
    
    {/* Location Section - Compact */}
    <div className="flex-[1.5] flex items-center px-5 py-2 w-full md:border-r border-black/10">
      <span className="text-lg mr-2">📍</span>
      <input
        type="text"
        placeholder="Where to live?"
        className="w-full outline-none text-gray-900 bg-transparent font-bold placeholder:text-gray-900 text-sm"
        value={filters.city}
        onChange={(e) => handleFilterChange('city', e.target.value)}
      />
    </div>

    {/* Property Type Section - Compact */}
    <div className="flex-1 px-5 w-full md:w-auto py-1">
      <select
        className="w-full outline-none text-gray-900 bg-transparent font-bold cursor-pointer text-sm appearance-none bg-no-repeat bg-right"
        style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'black\' stroke-width=\'3\' stroke-linecap=\'round\' stroke-linejoin=\'round\'><path d=\'M6 9l6 6 6-6\'/></svg>")', backgroundPosition: 'right 0px center', backgroundSize: '12px' }}
        value={filters.property_type}
        onChange={(e) => handleFilterChange('property_type', e.target.value)}
      >
        <option value="">All Types</option>
        <option value="room">Room</option>
        <option value="flat">Flat</option>
        <option value="house">House</option>
      </select>
    </div>

    {/* Slim Search Button */}
    <button 
      type="submit" 
      className="w-full md:w-auto bg-[#1A2B3C] hover:bg-black text-white px-8 py-2.5 rounded-full font-extrabold transition-all duration-300 shadow-md flex items-center justify-center gap-2 group text-sm"
    >
      SEARCH
      <span className="group-hover:translate-x-1 transition-transform">→</span>
    </button>
    
  </form>
</div>


          <div className="mt-6 sm:mt-8 flex flex-wrap justify-center gap-2 sm:gap-4 text-white/80 text-xs sm:text-sm font-medium">

            <span className="opacity-60 uppercase tracking-widest text-[10px] flex items-center">Trending Cities:</span>

            {['Kathmandu', 'Pokhara', 'Lalitpur', 'Butwal'].map(city => (

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

      { n: '3,000+', l: 'Listings' },

      { n: '10k+', l: 'Happy Users' },

      { n: '100%', l: 'Verified' },

      { n: '0%', l: 'Commission' }

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

          <div className="max-w-xl">

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black mb-2 sm:mb-4">Explore by <span className="text-[#00BFA5]">Category</span></h2>

            <p className="text-gray-500 text-sm sm:text-base">Tailored spaces for your unique lifestyle. From cozy rooms to spacious flats.</p>

          </div>

         

        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">

          {[

            { label: 'Single Room', icon: '🏠', type: 'room' },

            { label: 'Luxury Flat', icon: '🏢', type: 'flat' },

            { label: 'House', icon: '🏡', type: 'house' },

            { label: 'Office', icon: '💼', type: 'office' },

            { label: 'Roommate', icon: '🤝', type: 'roommate' }

          ].map((cat) => (

            <button

              key={cat.label}

              onClick={() => handleCategoryClick(cat.type)}

              className="group bg-white p-2 sm:p-4 md:p-4 rounded-2xl sm:rounded-3xl border border-gray-100 hover:border-[#00BFA5]/30 hover:shadow-[0_20px_40px_rgba(0,191,165,0.1)] transition-all duration-500 text-center"

            >

              <div className="text-3xl sm:text-4xl md:text-5xl mb-3 sm:mb-2 md:mb-4 transform group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-500">{cat.icon}</div>

              <p className="font-bold text-[#1A2B3C] group-hover:text-[#00BFA5] transition-colors text-xs sm:text-sm md:text-base">{cat.label}</p>

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

              <h2 className="text-lg sm:text-xl md:text-2xl font-black text-[#1A2B3C] uppercase tracking-tighter whitespace-nowrap">⭐ Premium Selection</h2>

              <div className="h-px bg-gray-200 flex-grow"></div>

            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 md:gap-10">

              {featuredProperties.slice(0, 4).map((p) => <PropertyCard key={p.id} property={p} />)}

            </div>

          </div>

        </section>

      )}



   {/* 5. NEW ARRIVALS */}

<section className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-4 md:py-6">

  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 sm:mb-12 gap-4">

    <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#1A2B3C]">Recently Added</h2>

    <Link

      to="/allproperties"

      className="group text-[#1A2B3C] font-bold flex items-center gap-2 hover:text-[#00BFA5]  transition-colors text-sm sm:text-base"

    >

      Explore All Listings <span className="group-hover:translate-x-2 transition-transform">→</span>

    </Link>

  </div>

 

  {loading ? (

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 md:gap-10">

      {[1, 2, 3].map(i => (

        <div key={i} className="h-64 sm:h-80 md:h-96 bg-gray-100 rounded-2xl sm:rounded-3xl animate-pulse" />

      ))}

    </div>

  ) : properties.length > 0 ? (

    // ✅ NO .slice() - 8 data comes from bacend

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 md:gap-10">

      {properties.map((p) => <PropertyCard key={p.id} property={p} />)}

    </div>

  ) : (

    <div className="text-center py-12 sm:py-16">

      <div className="text-4xl mb-4">🏠</div>

      <h3 className="text-lg sm:text-xl font-bold text-gray-600 mb-2">No properties found</h3>

      <p className="text-gray-500">Try adjusting your filters or check back later for new listings.</p>

    </div>

  )}

</section>

 <section class="py-16 px-4 sm:px-6 lg:px-20 bg-[#F0F2F5]">

    <div class="max-w-5xl mx-auto text-center">

      <h2 class="text-2xl sm:text-3xl font-extrabold mb-12 text-[#1A2B3C]">Who is this for?</h2>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

        <div class="bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg transition">

          <p class="text-xl font-bold mb-2">🎓 Students</p>

          <p class="text-gray-500">Near colleges, budget friendly.</p>

        </div>

        <div class="bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg transition">

          <p class="text-xl font-bold mb-2">👨‍💼 Professionals</p>

          <p class="text-gray-500">Quiet areas, parking available.</p>

        </div>

        <div class="bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg transition">

          <p class="text-xl font-bold mb-2">👨‍👩‍👧 Families</p>

          <p class="text-gray-500">Safe & spacious homes.</p>

        </div>

        <div class="bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg transition">

          <p class="text-xl font-bold mb-2">🧳 New in city</p>

          <p class="text-gray-500">Trusted & verified listings.</p>

        </div>

      </div>

    </div>

  </section>

   

 



<section className="py-16 md:py-24 bg-white border-b border-gray-100 px-4 sm:px-6">

  <div className="max-w-7xl mx-auto">

    <h2 className="text-center text-2xl md:text-3xl font-black text-[#1A2B3C] mb-16">

      Simple. Fast. Reliable.

    </h2>



    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">

      {[

        { t: 'Smart Discovery', d: 'Advanced filters to find exactly what you need.', i: '01' },

        { t: 'Verified Tours', d: 'Connect directly with owners for real visits.', i: '02' },

        { t: 'Secure Move-in', d: 'Paperwork and keys made simple.', i: '03' }

      ].map(step => (

        <div key={step.i} className="relative">

          <span className="absolute -top-10 -left-2 text-7xl font-black text-[#1A2B3C]/5">

            {step.i}

          </span>

          <h3 className="text-xl font-bold text-[#1A2B3C] mb-4 relative z-10">

            {step.t}

          </h3>

          <p className="text-gray-500 leading-relaxed relative z-10">

            {step.d}

          </p>

        </div>

      ))}

    </div>

  </div>

</section>

   <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16 md:pb-24">

    <FAQ/>

</section>





<section className="py-16 md:py-24 bg-[#F8FAFC] px-4 sm:px-6">

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

              <p className="font-bold text-[#1A2B3C]">Anil Sharma</p>

              <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">

                Verified Tenant

              </p>

            </div>

          </div>

        </div>

      ))}

    </div>

  </div>

</section>

<section className="relative max-w-7xl mx-auto px-4 sm:px-6 pb-20 md:pb-28">

  <div className="relative rounded-[50px] overflow-hidden bg-gradient-to-tr from-[#253442] via-[#1f3245] to-[#264463] p-10 sm:p-16 lg:p-24 text-center shadow-2xl">

   

    {/* Glow Accents */}

    <div className="absolute -top-36 -right-36 w-[480px] h-[480px] bg-[#00BFA5]/20 rounded-full blur-[160px] animate-pulse" />

    <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] bg-[#00BFA5]/10 rounded-full blur-[120px] animate-pulse" />



    <div className="relative z-10">

      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-6 tracking-tight">

        List Your Property <br />

        <span className="text-[#00BFA5]">For Free</span>

      </h2>



      <p className="text-white/75 text-base sm:text-lg max-w-xl mx-auto mb-12">

        Reach thousands of verified tenants and manage listings effortlessly — no brokers, no hidden charges.

      </p>



      <div className="flex flex-col sm:flex-row justify-center gap-6">

        <Link

          to={isAuthenticated ? "/post-ad" : "/login"}

          state={!isAuthenticated ? { from: "/post-ad" } : null}

          className="bg-[#00BFA5] text-[#1A2B3C] px-12 py-4 rounded-3xl font-extrabold text-lg hover:scale-105 hover:shadow-xl transition-transform shadow-[#00BFA5]/50"

        >

          Start Listing Now

        </Link>



        <Link

          to="/how-it-works"

          className="bg-white/10 text-white border border-white/20 px-12 py-4 rounded-3xl font-bold text-lg hover:bg-white/20 hover:backdrop-brightness-125 transition-all backdrop-blur-md"

        >

          Learn More

        </Link>

      </div>

    </div>

  </div>

</section>



      {/* 9. FOOTER */}

      <footer className="bg-[#1A2B3C] text-white pt-12 sm:pt-16 md:pt-24 pb-8 sm:pb-12 px-4 sm:px-6">

        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 md:gap-16 mb-12 sm:mb-16 md:mb-24">

          <div className="col-span-1 lg:col-span-1">

            <h2 className="text-2xl sm:text-3xl font-black mb-6 sm:mb-8 tracking-tighter">

              Room<span className="text-[#00BFA5]">Rental</span>

            </h2>

            <p className="text-white/40 leading-relaxed text-sm sm:text-base">

              Redefining the rental ecosystem in Nepal through technology, trust, and transparency.

            </p>

          </div>

          <div>

            <h4 className="font-bold text-white mb-4 sm:mb-8 text-base sm:text-lg uppercase tracking-widest">Platform</h4>

            <ul className="space-y-2 sm:space-y-4 text-white/50 font-medium text-sm sm:text-base">

              <li><Link to="/properties" className="hover:text-white transition">Search Properties</Link></li>

              <li><Link to="/featured" className="hover:text-white transition">Featured Homes</Link></li>

              <li><Link to="/post-ad" className="hover:text-white transition">List a Room</Link></li>

            </ul>

          </div>

          <div>

            <h4 className="font-bold text-white mb-4 sm:mb-8 text-base sm:text-lg uppercase tracking-widest">Company</h4>

            <ul className="space-y-2 sm:space-y-4 text-white/50 font-medium text-sm sm:text-base">

              <li><Link to="/about" className="hover:text-white transition">Our Story</Link></li>

              <li><Link to="/safety" className="hover:text-white transition">Safety First</Link></li>

              <li><Link to="/contact" className="hover:text-white transition">Contact Us</Link></li>

            </ul>

          </div>

          <div className="bg-white/5 p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl border border-white/10">

            <h4 className="font-bold text-white mb-3 sm:mb-4 text-base sm:text-lg">Join our Newsletter</h4>

            <div className="flex bg-white/10 rounded-lg sm:rounded-xl p-1">

              <input

                type="email"

                placeholder="Email"

                className="bg-transparent px-3 sm:px-4 py-2 outline-none w-full text-xs sm:text-sm"

              />

              <button className="bg-[#00BFA5] p-2 px-3 sm:px-4 rounded-lg font-bold text-xs sm:text-sm">Join</button>

            </div>

          </div>

        </div>

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-white/20 text-xs font-bold tracking-widest uppercase border-t border-white/5 pt-6 sm:pt-8 md:pt-12">

          <p className="text-center md:text-left mb-4 md:mb-0">© 2025 RoomRental. All rights reserved.</p>

          <div className="flex gap-4 sm:gap-6 md:gap-8">

            <span className="hover:text-white cursor-pointer transition">Facebook</span>

            <span className="hover:text-white cursor-pointer transition">Instagram</span>

            <span className="hover:text-white cursor-pointer transition">LinkedIn</span>

          </div>

        </div>

      </footer>

    </div>

  );

};



export default Home;