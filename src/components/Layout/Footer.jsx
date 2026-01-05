import { Link } from "react-router-dom";
import { FaFacebookF, FaInstagram, FaYoutube } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-[#1A2B3C] text-white pt-14 pb-8 px-4">
      
      {/* Main Footer */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-14">
        
        {/* Brand */}
        <div>
          <h2 className="text-3xl font-extrabold mb-5 tracking-tight">
            Room<span className="text-[#00BFA5]">Rental</span>
          </h2>
          <p className="text-white/50 text-sm leading-relaxed">
            Redefining the rental ecosystem in Nepal with trust, transparency, and smart technology.
          </p>
        </div>

        {/* Platform */}
        <div>
          <h4 className="text-sm font-bold uppercase tracking-widest mb-5">
            Platform
          </h4>
          <ul className="space-y-3 text-sm text-white/60">
            <li><Link to="/properties" className="hover:text-white transition">Search Properties</Link></li>
            <li><Link to="/featured" className="hover:text-white transition">Featured Homes</Link></li>
            <li><Link to="/post-ad" className="hover:text-white transition">List a Room</Link></li>
          </ul>
        </div>

        {/* Company */}
        <div>
          <h4 className="text-sm font-bold uppercase tracking-widest mb-5">
            Company
          </h4>
          <ul className="space-y-3 text-sm text-white/60">
            <li><Link to="/about" className="hover:text-white transition">Our Story</Link></li>
            <li><Link to="/safety" className="hover:text-white transition">Safety First</Link></li>
            <li><Link to="/contact" className="hover:text-white transition">Contact Us</Link></li>
          </ul>
        </div>

        {/* Newsletter */}
        <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
          <h4 className="text-sm font-bold mb-3">
            Join our Newsletter
          </h4>
          <div className="flex bg-white/10 rounded-lg p-1">
            <input
              type="email"
              placeholder="Your email"
              className="bg-transparent px-4 py-2 outline-none w-full text-sm"
            />
            <button className="bg-[#00BFA5] px-4 rounded-lg font-bold text-sm hover:opacity-90 transition">
              Join
            </button>
          </div>
        </div>

      </div>

      {/* Bottom Bar */}
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center border-t border-white/10 pt-6 text-xs text-white/40">
        <p className="mb-4 md:mb-0">
          © 2025 RoomRental. All rights reserved.
        </p>

        {/* Social Icons */}
        <div className="flex gap-5">
          <a href="#" className="hover:text-[#00BFA5] text-blue-500 transition hover:scale-110">
            <FaFacebookF size={30} />
          </a>
          <a href="#" className="hover:text-[#00BFA5] text-[#f518db] transition hover:scale-110">
            <FaInstagram size={30} />
          </a>
          <a href="#" className="hover:text-[#00BFA5] text-red-600 transition hover:scale-110">
            <FaYoutube size={34} />
          </a>
        </div>
      </div>

    </footer>
  );
};

export default Footer;
