
import React, { useState, useEffect } from 'react';
import { settingsService } from '../services/supabaseService';

const AnnouncementAd: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [adContent, setAdContent] = useState({ text: '', imageUrl: '' });

  useEffect(() => {
    // Cek apakah user sudah melihat/menutup iklan di sesi ini
    const hasSeenAd = sessionStorage.getItem('has_seen_ad');
    
    if (!hasSeenAd) {
      const fetchAd = async () => {
        try {
          const settings = await settingsService.get();
          // Hanya tampilkan jika ada teks iklan yang diatur admin di 'running_text'
          if (settings.running_text) {
            setAdContent({ 
              text: settings.running_text, 
              imageUrl: settings.hero_image_url || 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070&auto=format&fit=crop' 
            });
            
            // Delay 2 detik agar website termuat dulu sebelum iklan "melayang" masuk
            setTimeout(() => {
              setIsVisible(true);
            }, 2000);
          }
        } catch (err) {
          console.error("Gagal memuat pengumuman", err);
        }
      };
      fetchAd();
    }
  }, []);

  const handleClose = () => {
    // Simpan status ditutup agar tidak muncul lagi di sesi ini (sessionStorage)
    sessionStorage.setItem('has_seen_ad', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-24 right-6 z-[1500] w-[320px] sm:w-[380px] animate-slide-up font-sans pointer-events-auto">
      <div className="bg-white/95 backdrop-blur-xl rounded-[2.5rem] shadow-[0_20px_60px_rgba(30,58,138,0.25)] border border-blue-50 overflow-hidden relative group">
        
        {/* Close Button (X) */}
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 z-30 w-9 h-9 bg-slate-900/80 hover:bg-rose-600 text-white rounded-2xl backdrop-blur-md flex items-center justify-center transition-all shadow-xl active:scale-90"
          title="Tutup Iklan"
        >
          <i className="fa-solid fa-xmark text-sm"></i>
        </button>

        {/* Ad Image Header */}
        <div className="relative h-32 overflow-hidden">
           <img src={adContent.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="Promo" />
           <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent"></div>
           <div className="absolute bottom-4 left-6">
              <span className="bg-blue-600 text-white text-[9px] font-black px-3 py-1 rounded-lg uppercase tracking-widest shadow-lg shadow-blue-600/30">
                <i className="fa-solid fa-bolt-lightning mr-1"></i> Update
              </span>
           </div>
        </div>

        {/* Ad Content Body */}
        <div className="p-8">
           <div className="flex items-center gap-2 mb-4">
              <div className="w-1.5 h-4 bg-blue-600 rounded-full"></div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Pemberitahuan</p>
           </div>
           
           <h4 className="text-slate-900 font-black text-base mb-3 leading-tight tracking-tight">Informasi Terbaru</h4>
           <p className="text-slate-600 text-xs font-bold leading-relaxed mb-6">
             {adContent.text}
           </p>

           <div className="flex gap-3">
              <a 
                href="#/news" 
                onClick={handleClose}
                className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl text-center text-[10px] font-black uppercase tracking-[0.15em] hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 flex items-center justify-center gap-2"
              >
                Cek Detail <i className="fa-solid fa-arrow-right"></i>
              </a>
              <button 
                onClick={handleClose}
                className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
              >
                Tutup
              </button>
           </div>
        </div>

        {/* Decorative Progress Bar */}
        <div className="h-1 w-full bg-slate-50 relative">
           <div className="absolute top-0 left-0 h-full bg-blue-600 animate-progress-line"></div>
        </div>
      </div>
      
      <style>{`
        @keyframes progress-line {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        .animate-progress-line {
          animation: progress-line 15s linear forwards;
        }
        @keyframes slide-up {
          from { transform: translateY(100px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up {
          animation: slide-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default AnnouncementAd;
