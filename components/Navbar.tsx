
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
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    
    setIsLoggedIn(authService.isAuthenticated());

    const fetchSettings = async () => {
        const settings = await settingsService.get();
        if (settings.logo_url) setLogoUrl(settings.logo_url);
    };
    fetchSettings();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [location]);

  useEffect(() => {
    setIsOpen(false);
    window.scrollTo(0,0);
  }, [location.pathname]);

  const navLinks = [
    { name: 'Beranda', path: '/', icon: 'fa-house' },
    { name: 'Profil', path: '/profile', icon: 'fa-building-columns' },
    { name: 'Berita', path: '/news', icon: 'fa-newspaper' },
    { name: 'Agenda', path: '/agenda', icon: 'fa-calendar-days' },
    { name: 'Eskul', path: '/eskul', icon: 'fa-volleyball' },
    { name: 'Kontak', path: '/contact', icon: 'fa-address-book' },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    if (confirm("Sign out dari sesi Admin Hub?")) {
      await authService.logout();
      setIsLoggedIn(false);
      navigate('/', { replace: true });
      window.location.reload(); 
    }
  };

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-700 ease-in-out ${
        scrolled ? 'bg-white/80 backdrop-blur-2xl shadow-[0_10px_40px_rgba(0,0,0,0.05)] py-4' : 'bg-white py-8 border-b border-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex justify-between items-center h-12">
            
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-5 group">
                <div className={`w-12 h-12 rounded-[1.25rem] flex items-center justify-center text-white font-black text-2xl shadow-2xl transition-all duration-500 group-hover:rotate-12 group-hover:scale-110 ${logoUrl ? 'bg-transparent' : 'bg-blue-600 shadow-blue-200'}`}>
                  {logoUrl ? <img src={logoUrl} className="w-full h-full object-cover rounded-[1.25rem]" alt="Logo" /> : 'S2'}
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-black text-slate-900 leading-none tracking-tighter uppercase">SMKN 2</span>
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em] mt-1.5 opacity-80">Tembilahan Hub</span>
                </div>
              </Link>
            </div>

            <div className="hidden lg:flex items-center gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-500 ${
                    isActive(link.path)
                      ? 'bg-blue-600 text-white shadow-xl shadow-blue-100'
                      : 'text-slate-500 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              
              <div className="w-px h-8 bg-slate-100 mx-6"></div>

              {isLoggedIn ? (
                <div className="flex items-center gap-4">
                  <Link to="/admin/dashboard" className="px-8 py-4 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.3em] hover:bg-blue-600 shadow-2xl shadow-slate-200 transition-all hover:-translate-y-1">
                    Manage Console
                  </Link>
                  <button onClick={handleLogout} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-sm active:scale-90">
                     <i className="fa-solid fa-power-off text-base"></i>
                  </button>
                </div>
              ) : (
                <Link to="/admin" className="flex items-center gap-4 px-8 py-4 rounded-2xl border-2 border-slate-50 bg-slate-50/30 text-slate-900 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white hover:border-blue-100 hover:shadow-xl transition-all hover:-translate-y-1">
                  <i className="fa-solid fa-shield-halved text-blue-600"></i> Authenticate
                </Link>
              )}
            </div>

            <div className="lg:hidden flex items-center gap-4">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all duration-500 ${isOpen ? 'bg-slate-900 text-white rotate-90' : 'bg-slate-50 text-slate-900'}`}
              >
                <i className={`fa-solid ${isOpen ? 'fa-xmark' : 'fa-bars-staggered'} text-lg`}></i>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className={`lg:hidden fixed inset-0 z-[110] bg-slate-900/60 backdrop-blur-sm transition-opacity duration-700 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsOpen(false)}>
        <div className={`absolute top-0 right-0 bottom-0 w-[85%] max-w-sm bg-white shadow-2xl transition-transform duration-700 cubic-bezier(0.16, 1, 0.3, 1) p-10 flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`} onClick={e => e.stopPropagation()}>
           <div className="flex justify-between items-center mb-16">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-lg">S2</div>
                 <span className="font-black text-slate-900 tracking-tight text-xl uppercase">Navigasi</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="w-11 h-11 rounded-2xl bg-slate-50 flex items-center justify-center active:scale-90 transition-transform"><i className="fa-solid fa-xmark"></i></button>
           </div>

           <div className="flex-1 space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-6 px-8 py-5 rounded-2xl text-[12px] font-black uppercase tracking-[0.2em] transition-all duration-500 ${
                    isActive(link.path) ? 'bg-blue-600 text-white shadow-2xl shadow-blue-100 scale-[1.05]' : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <i className={`fa-solid ${link.icon} text-base w-7`}></i>
                  {link.name}
                </Link>
              ))}
           </div>

           <div className="pt-12 border-t border-slate-100 mt-12">
              {isLoggedIn ? (
                  <div className="space-y-4">
                    <Link to="/admin/dashboard" className="flex items-center justify-center w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl active:scale-95 transition-all">MANAGE CONSOLE</Link>
                    <button onClick={handleLogout} className="w-full py-4 text-rose-500 font-black text-[11px] uppercase tracking-widest active:scale-95">SIGN OUT HUB</button>
                  </div>
              ) : (
                  <Link to="/admin" className="flex items-center justify-center w-full py-6 border-2 border-slate-100 text-slate-900 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.2em] hover:bg-slate-900 hover:text-white transition-all active:scale-95">AUTHENTICATE HUB</Link>
              )}
           </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
