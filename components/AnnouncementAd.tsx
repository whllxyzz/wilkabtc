
import React, { useState, useEffect } from 'react';
import { settingsService } from '../services/supabaseService';

const AnnouncementAd: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [adContent, setAdContent] = useState({ text: '', imageUrl: '' });

  useEffect(() => {
    // Cek apakah user sudah melihat iklan di sesi ini
    const hasSeenAd = sessionStorage.getItem('has_seen_ad');
    
    if (!hasSeenAd) {
      const fetchAd = async () => {
        const settings = await settingsService.get();
        // Hanya tampilkan jika ada teks iklan yang diatur admin
        if (settings.running_text) {
          setAdContent({ 
            text: settings.running_text, 
            imageUrl: settings.hero_image_url || 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070&auto=format&fit=crop' 
          });
          setIsVisible(true);
        }
      };
      fetchAd();
    }
  }, []);

  useEffect(() => {
    if (isVisible && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, countdown]);

  const handleClose = () => {
    sessionStorage.setItem('has_seen_ad', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-900/95 backdrop-blur-xl animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-[3rem] overflow-hidden shadow-2xl animate-zoom-in relative">
        
        {/* Ad Header */}
        <div className="relative h-48 sm:h-64">
           <img src={adContent.imageUrl} className="w-full h-full object-cover" alt="School Update" />
           <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 to-transparent"></div>
           <div className="absolute bottom-6 left-8">
              <span className="bg-blue-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-[0.2em] mb-2 inline-block">Flash Update</span>
              <h2 className="text-white text-2xl font-black">Informasi Terkini</h2>
           </div>
        </div>

        {/* Ad Body */}
        <div className="p-10">
           <div className="flex items-center gap-3 mb-6">
              <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Update Hari Ini, {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} WIB</p>
           </div>
           
           <p className="text-slate-700 font-bold leading-relaxed mb-10 text-lg">
             {adContent.text}
           </p>

           <div className="relative h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mb-8">
              <div 
                className="absolute top-0 left-0 h-full bg-blue-600 transition-all duration-1000 ease-linear"
                style={{ width: `${(countdown / 5) * 100}%` }}
              ></div>
           </div>

           <button 
             onClick={handleClose}
             disabled={countdown > 0}
             className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-blue-100 ${
               countdown > 0 
               ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
               : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
             }`}
           >
             {countdown > 0 ? `Tunggu ${countdown} Detik...` : 'Lanjutkan ke Website'}
           </button>
        </div>

        {/* Badge Samping */}
        <div className="absolute top-6 right-8 text-white/50 text-[10px] font-bold uppercase tracking-widest">
           SMKN 2 Digital
        </div>
      </div>
    </div>
  );
};

export default AnnouncementAd;
