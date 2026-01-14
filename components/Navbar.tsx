
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { path: '/', label: 'Beranda' },
    { path: '/profile', label: 'Profil' },
    { path: '/news', label: 'Berita' },
    { path: '/gallery', label: 'Galeri' },
    { path: '/teachers', label: 'Guru' },
    { path: '/agenda', label: 'Agenda' },
    { path: '/eskul', label: 'Eskul' },
    { path: '/chat', label: 'Komunitas' },
  ];

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white/90 backdrop-blur-md shadow-lg py-4' : 'bg-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-blue-600/30 group-hover:scale-110 transition-transform">
              S2
            </div>
            <div className={`flex flex-col ${isScrolled ? 'text-slate-900' : 'text-slate-900'} lg:text-slate-900`}>
              <span className="font-black text-lg leading-none tracking-tight">SMKN 2</span>
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Tembilahan</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1 bg-white/50 backdrop-blur-sm px-2 py-1.5 rounded-full border border-white/20 shadow-sm">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-blue-600'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="hidden lg:flex items-center gap-4">
             <Link to="/contact" className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all">
                <i className="fa-regular fa-envelope"></i>
             </Link>
             <Link to="/admin" className="px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg hover:-translate-y-1">
                Admin
             </Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="lg:hidden w-10 h-10 bg-white rounded-xl shadow-md flex items-center justify-center text-slate-900"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <i className={`fa-solid ${isMobileMenuOpen ? 'fa-xmark' : 'fa-bars'}`}></i>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-white border-b border-slate-100 shadow-xl p-6 lg:hidden flex flex-col gap-2 animate-slide-up">
           {navLinks.map((link) => (
              <Link 
                key={link.path} 
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`p-4 rounded-xl font-bold text-sm ${location.pathname === link.path ? 'bg-blue-50 text-blue-600' : 'text-slate-600'}`}
              >
                {link.label}
              </Link>
           ))}
           <div className="h-px bg-slate-100 my-2"></div>
           <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)} className="p-4 rounded-xl font-bold text-sm text-slate-600">Hubungi Kami</Link>
           <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} className="p-4 rounded-xl font-black text-sm bg-slate-900 text-white text-center uppercase tracking-widest">
             Login Admin
           </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
