import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authService, settingsService } from '../services/supabaseService';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    setIsLoggedIn(authService.isAuthenticated());

    const fetchSettings = async () => {
        const settings = await settingsService.get();
        if (settings.logo_url) setLogoUrl(settings.logo_url);
    };
    fetchSettings();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [location]);

  const navLinks = [
    { name: 'Beranda', path: '/', icon: 'fa-house' },
    { name: 'Profil', path: '/profile', icon: 'fa-building-columns' },
    { name: 'Jurusan', path: '/departments', icon: 'fa-briefcase' }, // Changed link for future use
    { name: 'Berita', path: '/news', icon: 'fa-newspaper' },
    { name: 'Agenda', path: '/agenda', icon: 'fa-calendar-days' },
    { name: 'Kontak', path: '/contact', icon: 'fa-address-book' },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    if (confirm("Keluar dari sistem Admin?")) {
      await authService.logout();
      setIsLoggedIn(false);
      setIsOpen(false);
      navigate('/', { replace: true });
      window.location.reload(); 
    }
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
      scrolled ? 'glass-nav py-3' : 'bg-white py-5 border-b border-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          
          {/* Logo Section */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-3 group">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg transition-transform group-hover:scale-105 ${logoUrl ? 'bg-transparent' : 'bg-brand-600'}`}>
                {logoUrl ? <img src={logoUrl} className="w-full h-full object-cover rounded-lg" alt="Logo" /> : 'S2'}
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-brand-900 leading-none tracking-tight">SMKN 2</span>
                <span className="text-[10px] font-bold text-brand-600 uppercase tracking-[0.2em]">Tembilahan</span>
              </div>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                  isActive(link.path)
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-slate-600 hover:text-brand-600 hover:bg-white'
                }`}
              >
                {link.name}
              </Link>
            ))}
            
            <div className="w-px h-6 bg-slate-200 mx-3"></div>

            {isLoggedIn ? (
              <div className="flex items-center gap-2">
                <Link to="/admin/dashboard" className="px-5 py-2.5 rounded-full bg-brand-600 text-white text-xs font-bold uppercase tracking-wide hover:bg-brand-700 shadow-lg shadow-brand-200 transition-all transform hover:-translate-y-0.5">
                  Dashboard
                </Link>
                <button onClick={handleLogout} className="w-9 h-9 flex items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all">
                   <i className="fa-solid fa-power-off text-xs"></i>
                </button>
              </div>
            ) : (
              <Link to="/admin" className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-brand-200 text-brand-700 text-xs font-bold uppercase tracking-wide hover:bg-brand-50 transition-all">
                <i className="fa-solid fa-user-lock"></i> Admin
              </Link>
            )}
          </div>

          {/* Mobile Toggle */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-brand-50 text-brand-600 focus:outline-none"
            >
              <i className={`fa-solid ${isOpen ? 'fa-xmark' : 'fa-bars'} text-lg`}></i>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`lg:hidden absolute top-full left-0 right-0 bg-white border-t border-slate-100 shadow-xl transition-all duration-300 origin-top ${
        isOpen ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0 pointer-events-none'
      }`}>
        <div className="p-4 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold ${
                isActive(link.path) ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <i className={`fa-solid ${link.icon} w-6 text-center`}></i>
              {link.name}
            </Link>
          ))}
          <div className="border-t border-slate-100 pt-3 mt-2">
             {isLoggedIn ? (
                <Link to="/admin/dashboard" onClick={() => setIsOpen(false)} className="flex items-center justify-center w-full py-3 bg-brand-600 text-white rounded-xl font-bold text-sm">Dashboard Admin</Link>
             ) : (
                <Link to="/admin" onClick={() => setIsOpen(false)} className="flex items-center justify-center w-full py-3 border border-brand-200 text-brand-700 rounded-xl font-bold text-sm">Login Admin</Link>
             )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;